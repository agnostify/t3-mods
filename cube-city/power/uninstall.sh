#!/bin/sh
# Removes the Cube City power helper. The theme stays as it is right now.
set -u
LABEL="com.agnostify.t3-mods.cube-power"
launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null
rm -f "$HOME/Library/LaunchAgents/$LABEL.plist"
rm -f "$HOME/Library/Application Support/t3-mods/cube-power.sh" "$HOME/Library/Application Support/t3-mods/cube-city.json" "$HOME/Library/Application Support/t3-mods/cube-city-calm.json"
rmdir "$HOME/Library/Application Support/t3-mods" 2>/dev/null
echo "Removed the power helper."
