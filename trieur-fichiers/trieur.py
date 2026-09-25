#!/usr/bin/env python3
"""Trieur de fichiers prudent.

Range les fichiers qui traînent dans Téléchargements et sur le Bureau dans des
dossiers clairs (Images, Vidéos, Musique, Documents/PDF, Archives...).

Règles de sécurité :
  * rien n'est jamais supprimé ni modifié : les fichiers sont seulement déplacés
    dans un sous-dossier du même dossier ;
  * seuls les fichiers « inoffensifs » (photos, vidéos, musique, documents,
    archives, installateurs...) sont concernés ; tout ce qui est inconnu, les
    programmes, scripts, raccourcis, fichiers cachés, fichiers système, fichiers
    en cours de téléchargement ou ouverts est laissé en place ;
  * les fichiers récents (moins de 24 h par défaut) ne sont pas touchés ;
  * les sous-dossiers ne sont jamais ouverts ni réorganisés ; ils ne sont
    déplacés que sur demande (--dossiers) et seulement s'ils ne contiennent que
    des fichiers inoffensifs d'un même type (ex. un dossier de photos) ;
  * les dossiers système, le dossier personnel lui-même et les projets
    (git, code...) sont refusés ;
  * aucun fichier n'est écrasé : en cas de doublon de nom, « (2) » est ajouté ;
  * chaque déplacement est noté dans un journal et peut être annulé (--annuler).

Aucune dépendance : Python 3.8 ou plus récent suffit.
"""

import argparse
import datetime
import json
import os
import re
import stat
import sys
from collections import Counter, defaultdict
from pathlib import Path

VERSION = "1.0"

# Catégorie de destination -> extensions acceptées. Tout ce qui n'est pas ici
# est considéré comme « inconnu » et n'est jamais déplacé.
CATEGORIES = {
    "Images": {
        ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".heic", ".heif",
        ".tif", ".tiff", ".svg", ".ico", ".avif", ".raw", ".cr2", ".cr3",
        ".nef", ".arw", ".dng", ".orf", ".rw2", ".psd", ".xcf",
    },
    "Vidéos": {
        ".mp4", ".mkv", ".avi", ".mov", ".wmv", ".flv", ".webm", ".m4v",
        ".mpg", ".mpeg", ".3gp", ".ts", ".mts", ".m2ts",
    },
    "Musique": {
        ".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus",
        ".aiff", ".aif", ".mid", ".midi", ".alac",
    },
    "Documents/PDF": {".pdf"},
    "Documents/Texte": {".doc", ".docx", ".odt", ".rtf", ".txt", ".md", ".pages"},
    "Documents/Tableurs": {".xls", ".xlsx", ".ods", ".csv", ".numbers"},
    "Documents/Présentations": {".ppt", ".pptx", ".odp", ".key"},
    "Livres": {".epub", ".mobi", ".azw", ".azw3", ".djvu", ".cbz", ".cbr", ".fb2"},
    "Archives": {".zip", ".rar", ".7z", ".tar", ".gz", ".tgz", ".bz2", ".xz"},
    "Installateurs": {".msi", ".dmg", ".pkg", ".deb", ".rpm", ".apk", ".iso"},
    "Polices": {".ttf", ".otf", ".woff", ".woff2"},
}

EXTENSION_VERS_CATEGORIE = {
    ext: cat for cat, exts in CATEGORIES.items() for ext in exts
}

# Noms des dossiers créés par le trieur (premier niveau).
DOSSIERS_DU_TRIEUR = {cat.split("/")[0] for cat in CATEGORIES}

# Un .exe n'est déplacé que si son nom indique clairement un installateur :
# un .exe quelconque peut être un logiciel « portable » qui a besoin des
# fichiers posés à côté de lui.
MOTIF_INSTALLATEUR_EXE = re.compile(r"(setup|install|installer|installateur)", re.I)

# Fichiers sans importance qu'on peut ignorer quand on analyse un dossier.
FICHIERS_NEGLIGEABLES = {"desktop.ini", "thumbs.db", ".ds_store"}

# Présence de l'un de ces éléments = projet / logiciel : on n'y touche pas.
MARQUEURS_PROJET = {
    ".git", ".svn", ".hg", ".vscode", ".idea", "node_modules", "__pycache__",
    "package.json", "pyproject.toml", "setup.py", "requirements.txt",
    "makefile", "cmakelists.txt", "pom.xml", "build.gradle", "cargo.toml",
    "go.mod", "composer.json", "gemfile", ".project", ".sln",
}

# Archives découpées en plusieurs morceaux : on laisse les morceaux ensemble.
MOTIF_ARCHIVE_PARTIE = re.compile(r"\.part\d+\.rar$", re.I)
MOTIF_EXT_PARTIE = re.compile(r"^\.(z\d{2}|r\d{2}|\d{3})$", re.I)

ATTR_CACHE = 0x2        # FILE_ATTRIBUTE_HIDDEN
ATTR_SYSTEME = 0x4      # FILE_ATTRIBUTE_SYSTEM
ATTR_REPARSE = 0x400    # FILE_ATTRIBUTE_REPARSE_POINT (liens, jonctions)

EST_WINDOWS = os.name == "nt"


# --------------------------------------------------------------------------
# Dossiers de l'utilisateur
# --------------------------------------------------------------------------

def _dossier_connu_windows(guid):
    """Chemin réel d'un dossier Windows (gère OneDrive et les redirections)."""
    try:
        import ctypes
        import uuid
        from ctypes import wintypes

        class GUID(ctypes.Structure):
            _fields_ = [
                ("Data1", wintypes.DWORD),
                ("Data2", wintypes.WORD),
                ("Data3", wintypes.WORD),
                ("Data4", ctypes.c_ubyte * 8),
            ]

        u = uuid.UUID(guid)
        g = GUID(u.time_low, u.time_mid, u.time_hi_version,
                 (ctypes.c_ubyte * 8)(*u.bytes[8:]))
        ptr = ctypes.c_wchar_p()
        if ctypes.windll.shell32.SHGetKnownFolderPath(
                ctypes.byref(g), 0, None, ctypes.byref(ptr)) != 0:
            return None
        chemin = ptr.value
        ctypes.windll.ole32.CoTaskMemFree(ptr)
        return Path(chemin)
    except Exception:
        return None


def _dossier_xdg(cle):
    """Lit ~/.config/user-dirs.dirs (Linux, dossiers traduits)."""
    fichier = Path.home() / ".config" / "user-dirs.dirs"
    try:
        for ligne in fichier.read_text(encoding="utf-8").splitlines():
            if ligne.startswith(cle + "="):
                valeur = ligne.split("=", 1)[1].strip().strip('"')
                return Path(valeur.replace("$HOME", str(Path.home())))
    except OSError:
        pass
    return None


def dossiers_par_defaut():
    """Téléchargements et Bureau de l'utilisateur."""
    home = Path.home()
    trouves = []
    if EST_WINDOWS:
        candidats = [
            _dossier_connu_windows("{374DE290-123F-4565-9164-39C4925E467B}"),
            _dossier_connu_windows("{B4BFCC3A-DB2C-424C-B029-7FE99A87C641}"),
        ]
        candidats += [home / "Downloads", home / "Desktop"]
    else:
        candidats = [_dossier_xdg("XDG_DOWNLOAD_DIR"), _dossier_xdg("XDG_DESKTOP_DIR")]
        candidats += [home / "Downloads", home / "Téléchargements",
                      home / "Desktop", home / "Bureau"]
    for c in candidats:
        if c and c.is_dir() and c.resolve() != home.resolve():
            if all(c.resolve() != t.resolve() for t in trouves):
                trouves.append(c)
    return trouves


def dossier_journaux():
    if EST_WINDOWS:
        base = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
        return base / "TrieurFichiers" / "journaux"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "TrieurFichiers" / "journaux"
    return Path.home() / ".local" / "share" / "trieur-fichiers" / "journaux"


# --------------------------------------------------------------------------
# Règles de sécurité
# --------------------------------------------------------------------------

def dossiers_proteges():
    proteges = []
    if EST_WINDOWS:
        for var in ("SystemRoot", "windir", "ProgramFiles", "ProgramFiles(x86)",
                    "ProgramW6432", "ProgramData", "APPDATA", "LOCALAPPDATA"):
            if os.environ.get(var):
                proteges.append(Path(os.environ[var]))
        proteges.append(Path.home() / "AppData")
    else:
        for p in ("/bin", "/boot", "/dev", "/etc", "/lib", "/lib64", "/opt",
                  "/proc", "/sbin", "/sys", "/usr", "/var", "/snap",
                  "/System", "/Library", "/Applications"):
            proteges.append(Path(p))
        proteges.append(Path.home() / "Library")
    resultats = []
    for p in proteges:
        try:
            resultats.append(p.resolve())
        except OSError:
            pass
    return resultats


def contient_marqueur_projet(dossier):
    try:
        with os.scandir(dossier) as entrees:
            for entree in entrees:
                nom = entree.name.lower()
                if nom in MARQUEURS_PROJET or nom.endswith(".sln"):
                    return entree.name
    except OSError:
        return None
    return None


def refus_cible(dossier):
    """Raison de refuser un dossier cible, ou None s'il peut être trié."""
    try:
        p = Path(dossier).expanduser().resolve()
    except OSError as e:
        return "chemin illisible ({})".format(e)
    if not p.is_dir():
        return "ce dossier n'existe pas"
    if p == Path(p.anchor):
        return "c'est la racine d'un disque"
    home = Path.home().resolve()
    if p == home or p in home.parents:
        return "c'est le dossier personnel (ou un de ses parents) : trop large"
    for partie in p.relative_to(p.anchor).parts:
        if partie.startswith("."):
            return "c'est un dossier caché (réglages d'applications)"
    for protege in dossiers_proteges():
        if p == protege or protege in p.parents:
            return "c'est un dossier système ou d'applications ({})".format(protege)
    marqueur = contient_marqueur_projet(p)
    if marqueur:
        return "ça ressemble à un projet ou un logiciel (contient « {} »)".format(marqueur)
    return None


def est_lien_ou_special(chemin, st):
    if stat.S_ISLNK(st.st_mode):
        return True
    attrs = getattr(st, "st_file_attributes", 0)
    return bool(attrs & ATTR_REPARSE)


def est_cache_ou_systeme(nom, st):
    if nom.startswith("."):
        return True
    attrs = getattr(st, "st_file_attributes", 0)
    return bool(attrs & (ATTR_CACHE | ATTR_SYSTEME))


def date_recente(st):
    # Sous Windows st_ctime = date de création (arrivée du fichier).
    return max(st.st_mtime, st.st_ctime)


def categorie_de(nom, autoriser_exe_installateur=True):
    ext = os.path.splitext(nom)[1].lower()
    if ext == ".exe":
        if autoriser_exe_installateur and MOTIF_INSTALLATEUR_EXE.search(nom):
            return "Installateurs"
        return None
    return EXTENSION_VERS_CATEGORIE.get(ext)


def fichiers_verrouilles(noms):
    """Noms des documents actuellement ouverts dans Office / LibreOffice."""
    verrous_office = [n[2:].lower() for n in noms if n.startswith("~$")]
    ouverts = set()
    for n in noms:
        bas = n.lower()
        if any(bas.endswith(v) for v in verrous_office if v):
            ouverts.add(n)
        if ".~lock." + n + "#" in noms:
            ouverts.add(n)
    return ouverts


def fait_partie_archive_decoupee(nom, noms_bas):
    if MOTIF_ARCHIVE_PARTIE.search(nom):
        return True
    racine = os.path.splitext(nom)[0].lower()
    for autre in noms_bas:
        r, e = os.path.splitext(autre)
        if r == racine and MOTIF_EXT_PARTIE.match(e):
            return True
    return False


def raison_ignorer_fichier(entree, st, noms, noms_bas, ouverts, limite):
    nom = entree.name
    if est_lien_ou_special(entree.path, st):
        return None, "lien / raccourci système"
    if est_cache_ou_systeme(nom, st):
        return None, "fichier caché ou système"
    if nom.startswith("~$") or nom.startswith(".~lock"):
        return None, "fichier temporaire d'Office"
    if nom in ouverts:
        return None, "document actuellement ouvert"
    categorie = categorie_de(nom)
    if categorie is None:
        return None, "type non reconnu comme sûr (programme, script, raccourci, inconnu...)"
    if fait_partie_archive_decoupee(nom, noms_bas):
        return None, "morceau d'une archive découpée"
    if date_recente(st) > limite:
        return None, "trop récent"
    return categorie, None


def analyser_sous_dossier(chemin, limite, max_fichiers=10000):
    """Catégorie d'un sous-dossier s'il est sûr de le déplacer en entier."""
    compte = Counter()
    total = 0
    try:
        st = os.lstat(chemin)
        if date_recente(st) > limite:
            return None, "modifié récemment"
        for racine, sous_dossiers, fichiers in os.walk(chemin, followlinks=False):
            for d in sous_dossiers:
                complet = os.path.join(racine, d)
                sd = os.lstat(complet)
                if est_lien_ou_special(complet, sd):
                    return None, "contient un lien"
                if est_cache_ou_systeme(d, sd):
                    return None, "contient un dossier caché"
                if d.lower() in MARQUEURS_PROJET:
                    return None, "ressemble à un projet ({})".format(d)
            ouverts = fichiers_verrouilles(set(fichiers))
            for f in fichiers:
                if f.lower() in FICHIERS_NEGLIGEABLES:
                    continue
                complet = os.path.join(racine, f)
                sf = os.lstat(complet)
                if est_lien_ou_special(complet, sf):
                    return None, "contient un lien"
                if f.lower() in MARQUEURS_PROJET or f.lower().endswith(".sln"):
                    return None, "ressemble à un projet ({})".format(f)
                if est_cache_ou_systeme(f, sf) or f.startswith("~$"):
                    return None, "contient un fichier caché ou temporaire"
                if f in ouverts:
                    return None, "contient un document ouvert"
                cat = categorie_de(f, autoriser_exe_installateur=False)
                if cat is None:
                    return None, "contient un fichier non reconnu comme sûr ({})".format(f)
                if date_recente(sf) > limite:
                    return None, "contient un fichier récent"
                compte[cat] += 1
                total += 1
                if total > max_fichiers:
                    return None, "trop de fichiers"
    except OSError as e:
        return None, "illisible ({})".format(e)
    if total == 0:
        return None, "vide"
    cat, n = compte.most_common(1)[0]
    if n / total < 0.8:
        return None, "contenu trop varié"
    return cat, None


# --------------------------------------------------------------------------
# Planification
# --------------------------------------------------------------------------

class Plan:
    def __init__(self, dossier):
        self.dossier = Path(dossier)
        self.deplacements = []   # (source, destination, categorie, est_dossier)
        self.ignores = []        # (nom, raison)
        self.refus = None


def nom_libre(dossier_dest, nom, est_dossier, reserves):
    if est_dossier:
        racine, ext = nom, ""
    else:
        racine, ext = os.path.splitext(nom)
    candidat = dossier_dest / nom
    i = 2
    while os.path.lexists(candidat) or str(candidat).lower() in reserves:
        candidat = dossier_dest / "{} ({}){}".format(racine, i, ext)
        i += 1
    reserves.add(str(candidat).lower())
    return candidat


def planifier(dossier, age_min_heures=24, par_annee=False, inclure_dossiers=False,
              maintenant=None):
    plan = Plan(dossier)
    plan.refus = refus_cible(dossier)
    if plan.refus:
        return plan
    base = Path(dossier).expanduser().resolve()
    plan.dossier = base
    maintenant = maintenant if maintenant is not None else datetime.datetime.now().timestamp()
    limite = maintenant - age_min_heures * 3600

    with os.scandir(base) as it:
        entrees = sorted(it, key=lambda e: e.name.lower())
    noms = {e.name for e in entrees}
    noms_bas = {n.lower() for n in noms}
    ouverts = fichiers_verrouilles(noms)
    reserves = set()

    for entree in entrees:
        try:
            st = entree.stat(follow_symlinks=False)
        except OSError as e:
            plan.ignores.append((entree.name, "illisible ({})".format(e)))
            continue

        if stat.S_ISDIR(st.st_mode):
            if entree.name in DOSSIERS_DU_TRIEUR:
                continue
            if not inclure_dossiers:
                plan.ignores.append((entree.name + os.sep, "dossier (utilisez --dossiers pour les ranger)"))
                continue
            if est_lien_ou_special(entree.path, st) or est_cache_ou_systeme(entree.name, st):
                plan.ignores.append((entree.name + os.sep, "dossier caché, système ou lien"))
                continue
            cat, raison = analyser_sous_dossier(entree.path, limite)
            if cat is None:
                plan.ignores.append((entree.name + os.sep, raison))
                continue
            dest = nom_libre(base / cat, entree.name, True, reserves)
            plan.deplacements.append((Path(entree.path), dest, cat, True))
            continue

        if not stat.S_ISREG(st.st_mode) and not stat.S_ISLNK(st.st_mode):
            plan.ignores.append((entree.name, "élément spécial"))
            continue

        cat, raison = raison_ignorer_fichier(entree, st, noms, noms_bas, ouverts, limite)
        if cat is None:
            plan.ignores.append((entree.name, raison))
            continue
        dossier_dest = base / cat
        if par_annee:
            annee = datetime.datetime.fromtimestamp(st.st_mtime).year
            dossier_dest = dossier_dest / str(annee)
        dest = nom_libre(dossier_dest, entree.name, False, reserves)
        plan.deplacements.append((Path(entree.path), dest, cat, False))

    return plan


# --------------------------------------------------------------------------
# Exécution, journal et annulation
# --------------------------------------------------------------------------

class Journal:
    def __init__(self, chemin):
        self.chemin = chemin
        chemin.parent.mkdir(parents=True, exist_ok=True)
        self._f = open(chemin, "a", encoding="utf-8")
        self.ecrire({"action": "debut", "date": datetime.datetime.now().isoformat(),
                     "version": VERSION})

    def ecrire(self, donnees):
        self._f.write(json.dumps(donnees, ensure_ascii=False) + "\n")
        self._f.flush()
        os.fsync(self._f.fileno())

    def fermer(self):
        self._f.close()


def creer_dossiers(base, cible, journal):
    """Crée cible (sous base) en notant chaque dossier réellement créé."""
    a_creer = []
    p = cible
    while p != base and not p.exists():
        a_creer.append(p)
        p = p.parent
    for d in reversed(a_creer):
        d.mkdir()
        journal.ecrire({"action": "creation", "chemin": str(d)})


def appliquer(plans, journal):
    faits, echecs = 0, []
    for plan in plans:
        for source, dest, _cat, _est_dossier in plan.deplacements:
            try:
                creer_dossiers(plan.dossier, dest.parent, journal)
                if os.path.lexists(dest):
                    raise FileExistsError("la destination existe déjà")
                # os.rename : déplacement instantané sur le même disque, jamais
                # de copie partielle. Échoue proprement si le fichier est ouvert.
                os.rename(source, dest)
                journal.ecrire({"action": "deplacement", "de": str(source), "vers": str(dest)})
                faits += 1
            except OSError as e:
                echecs.append((source, e))
    return faits, echecs


def dernier_journal():
    dossier = dossier_journaux()
    if not dossier.is_dir():
        return None
    journaux = sorted(dossier.glob("tri-*.jsonl"))
    journaux = [j for j in journaux if not j.name.endswith(".annule.jsonl")]
    return journaux[-1] if journaux else None


def annuler():
    chemin = dernier_journal()
    if chemin is None:
        print("Aucun tri à annuler.")
        return 0
    lignes = [json.loads(l) for l in chemin.read_text(encoding="utf-8").splitlines() if l.strip()]
    remis, problemes = 0, []
    for ligne in reversed(lignes):
        if ligne["action"] == "deplacement":
            de, vers = Path(ligne["de"]), Path(ligne["vers"])
            if not os.path.lexists(vers):
                problemes.append("{} : n'est plus à {}".format(de.name, vers))
                continue
            if os.path.lexists(de):
                problemes.append("{} : un autre fichier occupe déjà sa place d'origine".format(de.name))
                continue
            try:
                os.rename(vers, de)
                remis += 1
            except OSError as e:
                problemes.append("{} : {}".format(de.name, e))
        elif ligne["action"] == "creation":
            try:
                os.rmdir(ligne["chemin"])   # ne supprime que s'il est vide
            except OSError:
                pass
    chemin.rename(chemin.with_name(chemin.stem + ".annule.jsonl"))
    print("{} élément(s) remis à leur place d'origine.".format(remis))
    for p in problemes:
        print("  ! " + p)
    return 0 if not problemes else 1


# --------------------------------------------------------------------------
# Affichage
# --------------------------------------------------------------------------

def afficher_plan(plan, details=False, maxi_par_categorie=8):
    print()
    print("=" * 70)
    print(" " + str(plan.dossier))
    print("=" * 70)
    if plan.refus:
        print("  REFUSÉ : " + plan.refus)
        return
    if not plan.deplacements:
        print("  Rien à ranger.")
    groupes = defaultdict(list)
    for source, dest, cat, est_dossier in plan.deplacements:
        groupes[cat].append((source, dest, est_dossier))
    for cat in sorted(groupes):
        elements = groupes[cat]
        print("  -> {}/  ({} élément(s))".format(cat, len(elements)))
        montres = elements if details else elements[:maxi_par_categorie]
        for source, dest, est_dossier in montres:
            nom = source.name + (os.sep if est_dossier else "")
            renomme = "" if dest.name == source.name else "   (renommé « {} »)".format(dest.name)
            sous = dest.parent.relative_to(plan.dossier / cat)
            sous = "" if str(sous) == "." else "   [{}]".format(sous)
            print("       {}{}{}".format(nom, sous, renomme))
        if len(montres) < len(elements):
            print("       ... et {} autre(s)".format(len(elements) - len(montres)))
    if plan.ignores:
        print("  Laissés en place : {}".format(len(plan.ignores)))
        if details:
            for nom, raison in plan.ignores:
                print("       {}  — {}".format(nom, raison))
        else:
            raisons = Counter(r for _n, r in plan.ignores)
            for raison, n in raisons.most_common():
                print("       {:>4} × {}".format(n, raison))


# --------------------------------------------------------------------------
# Programme principal
# --------------------------------------------------------------------------

def preparer_console():
    for flux in (sys.stdout, sys.stderr):
        try:
            flux.reconfigure(errors="replace")
        except (AttributeError, ValueError):
            pass


def demander(question):
    try:
        return input(question).strip().lower() in ("o", "oui", "y", "yes")
    except EOFError:
        return False


def main(argv=None):
    preparer_console()
    parser = argparse.ArgumentParser(
        prog="trieur",
        description="Range prudemment vos fichiers (Téléchargements et Bureau par défaut). "
                    "Sans option : montre ce qui serait fait puis demande confirmation.",
    )
    parser.add_argument("--dossier", action="append", metavar="CHEMIN",
                        help="dossier à trier (répétable). Par défaut : Téléchargements et Bureau.")
    parser.add_argument("--simulation", action="store_true",
                        help="montrer ce qui serait fait, sans rien déplacer")
    parser.add_argument("--appliquer", action="store_true",
                        help="trier sans poser de question (pour une tâche planifiée)")
    parser.add_argument("--annuler", action="store_true",
                        help="remettre tout comme avant le dernier tri")
    parser.add_argument("--dossiers", action="store_true",
                        help="ranger aussi les sous-dossiers qui ne contiennent qu'un seul type "
                             "de fichiers sûrs (ex. un dossier de photos)")
    parser.add_argument("--par-annee", action="store_true",
                        help="classer en plus par année (ex. Images/2025/)")
    parser.add_argument("--age-min", type=float, default=24, metavar="HEURES",
                        help="ne pas toucher aux fichiers plus récents que ça (défaut : 24)")
    parser.add_argument("--details", action="store_true",
                        help="lister chaque fichier et la raison de chaque fichier laissé en place")
    parser.add_argument("--version", action="version", version="%(prog)s " + VERSION)
    args = parser.parse_args(argv)

    if args.annuler:
        return annuler()

    cibles = [Path(d) for d in args.dossier] if args.dossier else dossiers_par_defaut()
    if not cibles:
        print("Aucun dossier Téléchargements ou Bureau trouvé. Utilisez --dossier CHEMIN.")
        return 1

    interactif = not args.simulation and not args.appliquer
    inclure_dossiers = args.dossiers
    if interactif and not inclure_dossiers:
        inclure_dossiers = demander(
            "Ranger aussi les sous-dossiers qui ne contiennent qu'un seul type de fichiers "
            "(ex. un dossier rempli de photos) ? [o/N] ")

    plans = [planifier(c, args.age_min, args.par_annee, inclure_dossiers) for c in cibles]
    for plan in plans:
        afficher_plan(plan, args.details)

    total = sum(len(p.deplacements) for p in plans)
    print()
    if total == 0:
        print("Rien à faire : tout est déjà rangé.")
        return 0
    if args.simulation:
        print("Simulation : {} élément(s) seraient rangés. Rien n'a été déplacé.".format(total))
        return 0
    if interactif and not demander("Ranger ces {} élément(s) ? [o/N] ".format(total)):
        print("Annulé, rien n'a été déplacé.")
        return 0

    horodatage = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    journal = Journal(dossier_journaux() / "tri-{}.jsonl".format(horodatage))
    try:
        faits, echecs = appliquer(plans, journal)
    finally:
        journal.fermer()
    print("{} élément(s) rangés.".format(faits))
    for source, erreur in echecs:
        print("  ! laissé en place : {} ({})".format(source.name, erreur))
    print("Pour tout remettre comme avant : trieur.py --annuler")
    return 0 if not echecs else 1


if __name__ == "__main__":
    sys.exit(main())
