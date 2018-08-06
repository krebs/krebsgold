#!/usr/bin/env nix-shell
#!nix-shell -p 7zip
rm -f src.zip
7z a -tzip src.zip README _locales/ fonts/ images/icon-*.png manifest.json scripts/ styles/ ./popup.html
