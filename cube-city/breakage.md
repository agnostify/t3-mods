# Breakage log: Cube City (T3 Code theme)

## T3 update renames the selectors
- Risk: the city hangs off `[data-workspace-area="conversation"]`, the busy state off `[data-timeline-row-kind="working"]`, the typing lift off `.composer-tiptap p:not(.is-empty)`. The area selector and `.composer-tiptap` are on T3's stable list; `working` and the `is-empty` class are not (found in T3's bundle on 2026-11-17).
- Trigger: a T3 Code update.
- Check: city gone means the area selector changed; city never lights up while a turn runs means the `working` row kind changed. Grep the new bundle in `/Applications/T3 Code (Beta).app/Contents/Resources/app.asar` for `kind:\`working\``.

## Theme size limit
- Risk: T3 caps theme CSS at 50,000 characters; this one is about 45,000.
- Trigger: adding cubes, buildings or motion.
- Check: `node build.mjs` prints the size and stops if either build is over 50,000.

## Something opaque inside the chat area hides the city
- Risk: the city sits at z-index -1 inside the chat area. If T3 gives an inner wrapper a solid background, the city vanishes.
- Trigger: a T3 layout change.
- Check: screenshot the window; if missing, make that wrapper transparent in the CSS.

## Cube look drifts from the approved kit
- Risk: cubes are drawn by `kit/cube-kit.js`, a copy of Agnostify's kit. A change to the original kit only reaches this repo when it's copied in again, then rebuilt and reinstalled.
- Check: rebuild, then `sh power/install.sh` (or `t3 theme set out/cube-city.json`).

## Theme file written directly
- Risk: the full CSS was written straight into `~/.t3/userdata/themes/cube-city.json` (the publish tool can't take 47,000 characters inline), so it skipped whatever checks that tool runs. T3 read it back fine on 2026-11-17.
- Trigger: a T3 update that changes the theme file format or adds validation.
- Check: after an update, if the city is gone, run `t3_theme_read` for cube-city and look for an error.

## Base colors
- Risk: any T3 theme must name a canvas and accent, so the base colors are set to T3's defaults (light #fcfcfc / #1b4ed8, dark #151517 / #346bf1). The dark canvas is a close guess, not T3's exact default.
- Check: if a surface looks slightly off from before, adjust `variants.dark.canvas` in the theme file.

## Mood triggers lean on hooks T3 doesn't promise to keep (added 2026-11-17)
- Risk: happy, sad and glancing read things that are not on T3's stable list: the sidebar row's `aria-label` text (", Completed", ", Failed"), its `aria-current="page"`, and the fallback banner's "Dismiss fallback model notice" label. A T3 update that rewords any of these silently turns that mood off. Only the glances use stable selectors.
- Also: the sidebar has to be open with that thread's row showing. A thread hidden in a collapsed project can't make the cubes happy.
- Check: in the harness, `set('done', true)` / `set('failed', true)` should still flip the cubes; then grep the new bundle for `label:\`Completed\`` and `"aria-label":Bt.label` style code in the sidebar row.

## "Usage out" is a guess at what T3 shows
- Risk: never tested for real (it would mean burning usage). The cubes go sad when the open thread shows "Failed" in the sidebar, which is how a provider error looks, or when T3's fallback-model banner appears (only if a fallback model is set in settings).
- Check: the next time usage actually runs out, glance at the cubes.

## The cheer fires on more than "done"
- Risk: the cheer plays whenever the working row leaves the open thread: a finished task, but also pressing stop, or switching away from a running thread. A failure goes sad instead.

## The click patch over the cubes
- Risk: over the cubes themselves (a small box per corner), the mouse wheel doesn't scroll the chat, because the click target sits on top. It only turns on when the chat area is at least 1540px wide, so it stays clear of the message column even in T3's wide chat layout (72rem). On a smaller window the cubes still glance and cheer, but hovering or clicking them does nothing.
- Check: if someone can't click or select text near a corner, raise the 1540px threshold in build.mjs or delete the ::after rule.

## Needs a modern Chromium
- Risk: the moods use `@property` and `sin()` inside `calc()`. T3's Electron has both today; an old engine would show cubes that never move.

## The idle hops cost more CPU than the first version
- Measured 2026-11-17 in the harness (Chrome, 2x screen, 10s idle, main-thread task time): first version 0.28s, lively build 0.9s, calm build (no idle bob or boss hops) 0.25s.
- That's why there are two builds and a power helper. Check: `node tools/perf.mjs` from cube-city/.

## The power helper (added 2026-11-17)
- What: a launchd agent (`com.agnostify.t3-mods.cube-power`) runs `power/cube-power.sh` once a minute. On the charger it puts the lively build in `~/.t3/userdata/themes/cube-city.json`, on battery the calm one. T3 watches that folder and reloads by itself. It never changes which theme is picked.
- Risk: it only swaps a file that matches one of its two copies in `~/Library/Application Support/t3-mods`. Every build has new random gradient ids, so after a rebuild the helper goes quiet until `sh power/install.sh` runs again.
- Risk: a T3 update that stops watching the themes folder would leave the swap on disk but not on screen until T3 restarts.
- Risk: it reads `pmset -g ps`. If Apple changes that wording, the helper treats everything as battery (calm), which is the safe side.
- Up to a minute's lag after plugging in or out. Undo: `sh power/uninstall.sh`.
