#!/bin/sh
# Cube City power helper: lively cubes (idle bob and boss hops) on the charger, calm cubes on battery.
# launchd runs this once a minute. It swaps T3's Cube City theme file between two builds of it, and T3 reloads
# the file by itself. It never changes which theme T3 shows, and it only replaces a theme file it put there itself.
set -u
# PMSET is only for tests (a fake pmset); launchd never sets it.
DIR="$HOME/Library/Application Support/t3-mods"
THEMES="${T3_THEMES_DIR:-$HOME/.t3/userdata/themes}"
THEME="$THEMES/cube-city.json"
LIVELY="$DIR/cube-city.json"
CALM="$DIR/cube-city-calm.json"

[ -f "$THEME" ] && [ -f "$LIVELY" ] && [ -f "$CALM" ] || exit 0

if "${PMSET:-/usr/bin/pmset}" -g ps 2>/dev/null | /usr/bin/head -n 1 | /usr/bin/grep -q "'AC Power'"; then
  WANT="$LIVELY"
else
  WANT="$CALM"
fi

/usr/bin/cmp -s "$THEME" "$WANT" && exit 0
# hands off anything else: a rebuilt or hand-edited theme file stays until install.sh puts a matching pair in place
/usr/bin/cmp -s "$THEME" "$LIVELY" || /usr/bin/cmp -s "$THEME" "$CALM" || exit 0

# copy beside the theme under a name T3 ignores (not .json), then rename over it so T3 never reads half a file
TMP="$THEMES/.cube-city.swap"
/bin/cp "$WANT" "$TMP" && /bin/mv -f "$TMP" "$THEME"
