# Trieur de fichiers

Range automatiquement le fouillis de **Téléchargements** et du **Bureau** dans des
dossiers clairs, en ne touchant qu'aux fichiers qu'on peut déplacer sans risque.

```
Téléchargements/
├── Archives/
├── Documents/
│   ├── PDF/
│   ├── Présentations/
│   ├── Tableurs/
│   └── Texte/
├── Images/
├── Installateurs/
├── Livres/
├── Musique/
├── Polices/
└── Vidéos/
```

## Installation

### Windows

1. Installez Python (gratuit) depuis <https://www.python.org/downloads/>.
   Pendant l'installation, **cochez « Add python.exe to PATH »**.
2. Copiez le dossier `trieur-fichiers` où vous voulez, par exemple dans `Documents`.
   Évitez Téléchargements et le Bureau : c'est ce qui va être rangé.
3. Double-cliquez sur **`trier.bat`**.

### macOS / Linux

Python 3 est souvent déjà installé. Double-cliquez sur `trier.command`, ou dans un terminal :

```sh
python3 trieur.py
```

## Utilisation

Au lancement, le trieur :

1. vous demande s'il doit aussi ranger les sous-dossiers « simples » (voir plus bas) ;
2. **montre la liste de ce qu'il va faire, sans rien toucher** ;
3. demande confirmation avant de déplacer quoi que ce soit.

Pour **tout remettre comme avant** : double-cliquez sur `annuler_dernier_tri.bat`
(ou `python3 trieur.py --annuler`).

### Options

| Commande | Effet |
|---|---|
| `trieur.py --simulation` | Montre seulement ce qui serait fait |
| `trieur.py --appliquer` | Trie sans poser de question (pour une tâche planifiée) |
| `trieur.py --annuler` | Annule le dernier tri |
| `trieur.py --dossier "D:\Photos à trier"` | Trie un autre dossier (option répétable) |
| `trieur.py --dossiers` | Range aussi les sous-dossiers qui ne contiennent qu'un seul type de fichiers |
| `trieur.py --par-annee` | Ajoute un classement par année (`Images/2025/…`) |
| `trieur.py --age-min 72` | Ne touche pas aux fichiers de moins de 72 h (24 h par défaut) |
| `trieur.py --details` | Liste chaque fichier, et pourquoi chaque fichier ignoré a été laissé en place |

Sous Windows, ces options s'utilisent aussi avec `trier.bat`, par exemple `trier.bat --simulation`.

## Ce qui est déplacé (et ce qui ne l'est jamais)

**Déplacé** : uniquement les fichiers posés directement dans le dossier et dont le
type est connu et sans danger. Ça couvre les photos, vidéos, musique, PDF, documents
Word/LibreOffice, tableurs, présentations, livres numériques, archives (`.zip`,
`.rar`…), polices, et les installateurs (`.msi`, `.dmg`, `.iso`, et les `.exe` dont le
nom contient *setup* ou *install*).

**Jamais touché :**

- les programmes (`.exe` ordinaires), scripts (`.bat`, `.ps1`, `.py`…), raccourcis (`.lnk`, `.url`) et DLL ;
- tout type de fichier inconnu ;
- les fichiers cachés ou système (`desktop.ini`…) ;
- les téléchargements en cours (`.crdownload`, `.part`…) et les fichiers de moins de 24 h ;
- les documents ouverts dans Word, Excel ou LibreOffice ;
- les morceaux d'archives découpées (`.part1.rar`, `.z01`…), laissés ensemble ;
- les liens symboliques et les jonctions ;
- le contenu des sous-dossiers. Avec `--dossiers`, un sous-dossier n'est déplacé
  **en entier** que s'il ne contient que des fichiers sûrs, dont au moins 80 % du même
  type (par exemple un dossier de photos). Un dossier qui contient un programme, un
  fichier inconnu, un fichier caché ou un projet (`.git`, `package.json`…) reste en place.

**Dossiers refusés d'office** : la racine d'un disque, votre dossier personnel,
Windows, Program Files, AppData, les dossiers cachés, les dossiers système
macOS/Linux, et tout dossier qui ressemble à un projet de code.

**Garanties** :

- rien n'est jamais supprimé ni modifié ;
- aucun fichier n'est écrasé : si `photo.jpg` existe déjà, le nouveau devient `photo (2).jpg` ;
- chaque fichier est déplacé en une seule opération, sans copie partielle ;
- chaque déplacement est noté dans un journal, ce qui permet de l'annuler. Le journal se
  trouve dans `%LOCALAPPDATA%\TrieurFichiers\journaux` sous Windows,
  `~/Library/Application Support/TrieurFichiers/journaux` sous macOS et
  `~/.local/share/trieur-fichiers/journaux` sous Linux.

## Trier automatiquement chaque semaine (Windows)

1. Ouvrez le **Planificateur de tâches**, puis **Créer une tâche de base…**
2. Déclencheur : *Chaque semaine*.
3. Action : *Démarrer un programme*.
   - Programme : `py`
   - Arguments : `-3 "C:\chemin\vers\trieur-fichiers\trieur.py" --appliquer`
     (ajoutez `--dossiers` si vous voulez aussi ranger les sous-dossiers).

## Personnaliser

Les catégories et les extensions sont définies en haut de `trieur.py`, dans
`CATEGORIES`. Ajoutez une extension à une catégorie pour la faire ranger, ou créez
une nouvelle catégorie (`"Modèles 3D": {".stl", ".3mf"}`, par exemple).

## Tests

```sh
python3 -m unittest test_trieur.py
```
