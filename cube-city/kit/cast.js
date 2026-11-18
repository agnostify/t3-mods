// The Agnostify cube cast: names, colours and settings for CubeKit.cube(). Cube City draws Cubsy, Maya and Nora.
//
// c is the on-screen colour. lacquer and blush3d are inputs for a 3D render; 'TODO' means that cube hasn't been
// rendered in 3D yet.
//
// A member: n name, c on-screen hex, job, vibe (one line), acc (one key of CubeKit.ACC), idle, tilt (degrees),
// look ([x, y] gaze offset), eyeAnim, eyes ({ size, lid, brow, happy, lash, L: {...}, R: {...} }).
globalThis.CUBE_CAST = {
  // Alec's three: the colours every new cube is measured against
  originals: [
    { n: 'Cubsy', c: '#5b95f2', lacquer: '0x1f5ee6', blush3d: '0xf2a0aa', role: 'Audit character' },
    { n: 'Maya', c: '#a59cf2', lacquer: '0x6f45f2', blush3d: '0xf5a6d2', role: 'Crew boss, Alec’s lavender' },
    { n: 'Nora', c: '#e9773f', lacquer: '0xff5a26', blush3d: '0xffa2ae', role: 'Content boss, Alec’s coral' },
  ],
  teams: [
    {
      id: 'crew', eyebrow: 'Crew demo', title: 'The crew',
      boss: { n: 'Maya', c: '#a59cf2', acc: 'headset', job: 'The boss', eyes: { brow: 5, lid: .1 }, vibe: 'Confident. Splits your job up and calls each teammate in by name.', lacquer: '0x6f45f2', blush3d: '0xf5a6d2' },
      members: [
        { n: 'Sara', c: '#4cc6c1', acc: 'lens', job: 'Research', idle: 'lean', tilt: 4, eyes: { size: 1.12 }, vibe: 'Nosy in the best way. Eyes go huge at a good find.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Paul', c: '#97a3bf', acc: 'sticky', job: 'Context keeper', idle: 'breathe', eyes: { lid: .36, brow: 2 }, vibe: 'Unbothered. Remembers what you said in March.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Tyson', c: '#f1bc42', acc: 'sweatband', job: 'Fast writer', idle: 'bounce', eyes: { size: 1.16 }, vibe: 'Over-caffeinated. Done before you finish asking.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Gigi', c: '#ef82ba', acc: 'checkbook', job: 'Marketing taste', idle: 'sway', tilt: -5, eyes: { lash: true, L: { lid: .3, brow: -4 }, R: { lid: .08, brow: 7 } }, vibe: 'Picky. One eyebrow up until the copy earns it.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Joe', c: '#5cc98b', acc: 'glasses', job: 'Double-checker', eyeAnim: 'scan', eyes: { lid: .34, brow: -8 }, vibe: 'Suspicious of every number. Checks twice, nods once.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Juno', c: '#5ab9ee', acc: 'phone', job: 'Texts your leads', idle: 'sway', look: [4, -2], eyes: { size: 1.08, lid: .1, brow: 4 }, vibe: 'Easygoing. Texts every lead back before they put their phone down.', lacquer: 'TODO', blush3d: 'TODO' },
      ],
    },
    {
      id: 'content', eyebrow: 'Content demo', title: 'The content team',
      boss: { n: 'Nora', c: '#e9773f', acc: 'phone', job: 'The boss', look: [5, -1], eyes: { happy: true }, vibe: 'Feed-obsessed. Knows in half a second if a post will stop a thumb.', lacquer: '0xff5a26', blush3d: '0xffa2ae' },
      members: [
        { n: 'Leo', c: '#a5d24c', acc: 'binoculars', job: 'Trend scout', eyeAnim: 'peek', eyes: { size: 1.12 }, vibe: 'Restless. Spots tomorrow’s trend from across the room.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Max', c: '#e65a6c', acc: 'clapper', job: 'Video editor', tilt: -6, eyes: { L: { happy: true }, R: { size: 1.08 } }, vibe: 'Dramatic. Every cut gets a wink and a bow.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Iris', c: '#c784de', acc: 'pencil', job: 'Caption writer', idle: 'sway', look: [4, 5], eyes: { lid: .14 }, vibe: 'Witty. Stares at the ceiling, then lands the line.', lacquer: 'TODO', blush3d: 'TODO' },
        { n: 'Kai', c: '#ddd5c4', acc: 'tablet', job: 'Numbers', idle: 'breathe', look: [0, 7], eyes: { size: .86, lid: .14 }, vibe: 'Quiet. Reads what worked and tunes the next post.', lacquer: 'TODO', blush3d: 'TODO' },
      ],
    },
  ],
};
