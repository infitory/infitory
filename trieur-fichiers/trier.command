#!/bin/sh
# macOS / Linux : double-cliquez (ou lancez ./trier.command dans un terminal).
cd "$(dirname "$0")" || exit 1
python3 trieur.py "$@"
printf "\nAppuyez sur Entrée pour fermer..."
read -r _
