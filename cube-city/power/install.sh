#!/bin/sh
# Installs the Cube City power helper for the current user. Run after node build.mjs:
#   sh power/install.sh     (from the cube-city folder)
# It copies the helper and both builds to ~/Library/Application Support/t3-mods, publishes the lively build as
# T3 theme cube-city (T3 picks it up by itself), and adds a launchd agent that runs the helper once a minute.
set -eu
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DIR="$HOME/Library/Application Support/t3-mods"
THEMES="${T3_THEMES_DIR:-$HOME/.t3/userdata/themes}"
LABEL="com.agnostify.t3-mods.cube-power"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

for f in "$HERE/out/cube-city.json" "$HERE/out/cube-city-calm.json"; do
  [ -f "$f" ] || { echo "Missing $f. Run node build.mjs first." >&2; exit 1; }
done

case "$DIR" in *'&'*|*'<'*|*'>'*) echo "Your home folder path has & < or > in it, which this installer can't write into a launchd file." >&2; exit 1;; esac

# Only replace a cube-city theme that came from this repo or this helper (or none), unless FORCE=1.
CUR="$THEMES/cube-city.json"
if [ -L "$CUR" ] || { [ -e "$CUR" ] && [ ! -f "$CUR" ]; }; then
  echo "$CUR is a link or a folder, not a plain file. Leaving everything as it is." >&2; exit 1
fi
if [ ! -f "$CUR" ] || [ "${FORCE:-}" = 1 ] || cmp -s "$CUR" "$DIR/cube-city.json" || cmp -s "$CUR" "$DIR/cube-city-calm.json" \
   || cmp -s "$CUR" "$HERE/out/cube-city.json" || cmp -s "$CUR" "$HERE/out/cube-city-calm.json"; then
  PLACE=1
else
  PLACE=0
fi

mkdir -p "$DIR" "$THEMES" "$HOME/Library/LaunchAgents"
cp "$HERE/power/cube-power.sh" "$HERE/out/cube-city.json" "$HERE/out/cube-city-calm.json" "$DIR/"
if [ "$PLACE" = 1 ]; then
  cp "$HERE/out/cube-city.json" "$THEMES/.cube-city.swap"
  mv -f "$THEMES/.cube-city.swap" "$CUR"
else
  echo "Left your existing cube-city theme as it is, since this helper didn't make it. The helper won't touch it either. Run again with FORCE=1 to replace it."
fi

cat > "$PLIST" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key><array><string>/bin/sh</string><string>$DIR/cube-power.sh</string></array>
  <key>StartInterval</key><integer>60</integer>
  <key>RunAtLoad</key><true/>
  <key>ProcessType</key><string>Background</string>
  <key>LowPriorityIO</key><true/>
  <key>Nice</key><integer>10</integer>
</dict>
</plist>
PLIST

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
# bootout can return before the old job is gone, so give bootstrap one retry
launchctl bootstrap "gui/$(id -u)" "$PLIST" 2>/dev/null || { sleep 2; launchctl bootstrap "gui/$(id -u)" "$PLIST"; }
echo "Installed. Cube City is lively on the charger and calm on battery. Undo: sh power/uninstall.sh"
