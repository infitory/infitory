"""Tests du trieur : python -m unittest test_trieur.py"""

import io
import os
import shutil
import tempfile
import time
import unittest
from contextlib import redirect_stdout
from pathlib import Path
from unittest import mock

import trieur

VIEUX = time.time() - 10 * 24 * 3600


def creer(chemin, contenu="x", vieux=True):
    chemin.parent.mkdir(parents=True, exist_ok=True)
    chemin.write_text(contenu)
    if vieux:
        os.utime(chemin, (VIEUX, VIEUX))
    return chemin


class BaseTest(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        self.home = self.tmp / "home"
        self.dl = self.home / "Downloads"
        self.dl.mkdir(parents=True)
        self.patch = mock.patch.dict(os.environ, {"HOME": str(self.home)})
        self.patch.start()
        # ctime ne peut pas être antidaté dans un test : on se base sur mtime.
        self.patch_date = mock.patch.object(trieur, "date_recente", lambda st: st.st_mtime)
        self.patch_date.start()

    def tearDown(self):
        self.patch.stop()
        self.patch_date.stop()
        shutil.rmtree(self.tmp)

    def lancer(self, *args):
        with redirect_stdout(io.StringIO()) as out:
            code = trieur.main(["--dossier", str(self.dl), *args])
        return code, out.getvalue()


class TestTri(BaseTest):
    def test_range_les_fichiers_surs(self):
        creer(self.dl / "photo.JPG")
        creer(self.dl / "facture.pdf")
        creer(self.dl / "chanson.mp3")
        creer(self.dl / "setup_logiciel.exe")
        code, _ = self.lancer("--appliquer")
        self.assertEqual(code, 0)
        self.assertTrue((self.dl / "Images" / "photo.JPG").exists())
        self.assertTrue((self.dl / "Documents" / "PDF" / "facture.pdf").exists())
        self.assertTrue((self.dl / "Musique" / "chanson.mp3").exists())
        self.assertTrue((self.dl / "Installateurs" / "setup_logiciel.exe").exists())

    def test_laisse_les_fichiers_a_risque(self):
        a_garder = [
            "programme.exe", "script.bat", "outil.py", "raccourci.lnk",
            "site.url", "inconnu.xyz", ".cache.jpg", "~$rapport.docx",
            "film.mp4.crdownload", "gros.part", "sans_extension",
        ]
        for nom in a_garder:
            creer(self.dl / nom)
        creer(self.dl / "recent.jpg", vieux=False)
        self.lancer("--appliquer")
        for nom in a_garder + ["recent.jpg"]:
            self.assertTrue((self.dl / nom).exists(), nom)

    def test_document_ouvert_laisse_en_place(self):
        creer(self.dl / "Rapport.docx")
        creer(self.dl / "~$pport.docx")
        self.lancer("--appliquer")
        self.assertTrue((self.dl / "Rapport.docx").exists())

    def test_archive_decoupee_laissee_en_place(self):
        creer(self.dl / "gros.zip")
        creer(self.dl / "gros.z01")
        creer(self.dl / "film.part1.rar")
        self.lancer("--appliquer")
        self.assertTrue((self.dl / "gros.zip").exists())
        self.assertTrue((self.dl / "film.part1.rar").exists())

    def test_jamais_ecraser(self):
        creer(self.dl / "Images" / "photo.jpg", "ancienne")
        creer(self.dl / "photo.jpg", "nouvelle")
        self.lancer("--appliquer")
        self.assertEqual((self.dl / "Images" / "photo.jpg").read_text(), "ancienne")
        self.assertEqual((self.dl / "Images" / "photo (2).jpg").read_text(), "nouvelle")

    def test_simulation_ne_touche_a_rien(self):
        creer(self.dl / "photo.jpg")
        code, sortie = self.lancer("--simulation")
        self.assertEqual(code, 0)
        self.assertIn("Simulation", sortie)
        self.assertTrue((self.dl / "photo.jpg").exists())
        self.assertFalse((self.dl / "Images").exists())

    def test_par_annee(self):
        creer(self.dl / "photo.jpg")
        self.lancer("--appliquer", "--par-annee")
        annee = str(time.localtime(VIEUX).tm_year)
        self.assertTrue((self.dl / "Images" / annee / "photo.jpg").exists())

    def test_sous_dossiers_ignores_par_defaut(self):
        creer(self.dl / "vacances" / "a.jpg")
        self.lancer("--appliquer")
        self.assertTrue((self.dl / "vacances" / "a.jpg").exists())

    def test_sous_dossiers_surs_ranges_avec_option(self):
        photos = self.dl / "vacances"
        for i in range(5):
            creer(photos / "p{}.jpg".format(i))
        creer(photos / "desktop.ini")
        os.utime(photos, (VIEUX, VIEUX))
        logiciel = self.dl / "logiciel"
        creer(logiciel / "app.exe")
        creer(logiciel / "logo.png")
        os.utime(logiciel, (VIEUX, VIEUX))
        projet = self.dl / "projet"
        creer(projet / "notes.txt")
        (projet / ".git").mkdir()
        os.utime(projet, (VIEUX, VIEUX))
        self.lancer("--appliquer", "--dossiers")
        self.assertTrue((self.dl / "Images" / "vacances" / "p0.jpg").exists())
        self.assertTrue((self.dl / "logiciel" / "app.exe").exists())
        self.assertTrue((self.dl / "projet" / "notes.txt").exists())

    def test_annuler(self):
        creer(self.dl / "photo.jpg")
        creer(self.dl / "doc.pdf")
        self.lancer("--appliquer")
        self.assertFalse((self.dl / "photo.jpg").exists())
        with redirect_stdout(io.StringIO()):
            self.assertEqual(trieur.main(["--annuler"]), 0)
        self.assertTrue((self.dl / "photo.jpg").exists())
        self.assertTrue((self.dl / "doc.pdf").exists())
        self.assertFalse((self.dl / "Images").exists())
        self.assertFalse((self.dl / "Documents").exists())

    def test_relancer_ne_redeplace_pas(self):
        creer(self.dl / "photo.jpg")
        self.lancer("--appliquer")
        code, sortie = self.lancer("--appliquer", "--dossiers")
        self.assertIn("Rien à faire", sortie)
        self.assertTrue((self.dl / "Images" / "photo.jpg").exists())


class TestCiblesRefusees(BaseTest):
    def test_refus(self):
        self.assertIsNotNone(trieur.refus_cible(self.home))
        self.assertIsNotNone(trieur.refus_cible(self.tmp))
        self.assertIsNotNone(trieur.refus_cible("/"))
        self.assertIsNotNone(trieur.refus_cible("/usr/share"))
        cache = self.home / ".config" / "app"
        cache.mkdir(parents=True)
        self.assertIsNotNone(trieur.refus_cible(cache))
        projet = self.home / "code"
        (projet / ".git").mkdir(parents=True)
        self.assertIsNotNone(trieur.refus_cible(projet))
        self.assertIsNone(trieur.refus_cible(self.dl))

    def test_cible_refusee_intacte(self):
        creer(self.home / "photo.jpg")
        with redirect_stdout(io.StringIO()):
            trieur.main(["--dossier", str(self.home), "--appliquer"])
        self.assertTrue((self.home / "photo.jpg").exists())


if __name__ == "__main__":
    unittest.main()
