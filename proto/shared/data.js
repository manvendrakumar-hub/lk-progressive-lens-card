/* Shared data for every prototype (V1, V2, V3). Source of truth: the original price card (Figma MRHF8OAWoWkJODtJQVwC29).
   f[featureId] : 0 = not included, 1 = included, 2 = enhanced level (two ticks on the printed card). */
window.LK = (function () {
  const features = [
    { id: 'smooth',  label: 'Smooth Power Transition', short: 'Smooth transition', blurb: 'A gentler change between the distance and near zones of the lens.' },
    { id: 'driving', label: 'Confident Driving Vision', short: 'Driving vision',   blurb: 'Clear, comfortable vision for the road.' },
    { id: 'uv',      label: 'UV 400 Sun Protection',    short: 'UV 400',           blurb: 'Protects your eyes from harmful UV light up to 400 nm.' },
    { id: 'blue',    label: 'Blue Light Block',          short: 'Blue light block', blurb: 'Filters blue light from screens.' },
    { id: 'smudge',  label: 'Smudge Resistant',          short: 'Smudge resistant', blurb: 'Stays cleaner, with fewer fingerprints and smudges.' },
    { id: 'scratch', label: 'Scratch Resistant',         short: 'Scratch resistant', blurb: 'Stands up better to everyday scratches.' },
    { id: 'anti',    label: 'Anti-Glare',                short: 'Anti-glare',       blurb: 'Cuts reflections and glare from lights and screens.' },
  ];

  const L = (o) => Object.assign({ tags: [], warranty: false, nightDrive: false, note: {} }, o);
  const lenses = [
    L({ id: 'l1', x: 1,  group: 'everyday', brand: 'Lenskart',       name: 'Anti-Glare',            view: 'Normal View',           index: '1.56',  indexPrefix: '',      price: 1600,  addon: 1200, tags: ['free-lens'],
        f: { smooth: 0, driving: 0, uv: 0, blue: 0, smudge: 1, scratch: 1, anti: 1 } }),
    L({ id: 'l2', x: 1,  group: 'everyday', brand: 'Lenskart',       name: 'BLU',                   view: 'Normal View',           index: '1.56',  indexPrefix: '',      price: 3000,  addon: 1500,
        f: { smooth: 0, driving: 0, uv: 0, blue: 1, smudge: 1, scratch: 1, anti: 1 } }),
    L({ id: 'l3', x: 2,  group: 'everyday', brand: 'Lenskart',       name: 'BLU',                   view: 'Wide View',             index: '1.6',   indexPrefix: 'Upto ', price: 4600,  addon: 2000,
        f: { smooth: 0, driving: 0, uv: 1, blue: 1, smudge: 1, scratch: 1, anti: 1 } }),
    L({ id: 'l4', x: 3,  group: 'everyday', brand: 'Lenskart Premium', name: 'BLU Thin',            view: 'Wider+ View',           index: '1.67',  indexPrefix: 'Upto ', price: 6600,  addon: 2500, warranty: true,
        f: { smooth: 0, driving: 1, uv: 2, blue: 2, smudge: 1, scratch: 1, anti: 1 } }),
    L({ id: 'l5', x: 5,  group: 'everyday', brand: 'Owndays Japan',  name: 'iShield BLU Thin',      view: 'Extra Wide View',       index: '1.67',  indexPrefix: 'Upto ', price: 10600, addon: 3000, warranty: true, nightDrive: true, tags: ['recommended'],
        f: { smooth: 2, driving: 2, uv: 2, blue: 2, smudge: 2, scratch: 2, anti: 2 } }),
    L({ id: 'l6', x: 5,  group: 'special',  brand: 'Owndays Japan',  name: 'Shield BLU Thin',       view: 'Extra Wide View',       index: '1.67',  indexPrefix: 'Upto ', price: 10600, addon: 3000, warranty: true, nightDrive: true,
        f: { smooth: 2, driving: 2, uv: 2, blue: 2, smudge: 2, scratch: 2, anti: 2 } }),
    L({ id: 'l7', x: 7,  group: 'special',  brand: 'Owndays Japan',  name: 'BLU+ Thin',             view: 'Wider+ AI Adaptive View', index: '1.74', indexPrefix: 'Upto ', price: 15600, addon: 3500, warranty: true, tags: ['bestseller'], note: { smooth: 'Fast adoption' },
        f: { smooth: 2, driving: 2, uv: 2, blue: 2, smudge: 2, scratch: 2, anti: 2 } }),
    L({ id: 'l8', x: 10, group: 'special',  brand: 'Rodenstock or Tokai Japan', name: 'AI Adaptive',  view: 'AI Adaptive View',      index: '1.67',  indexPrefix: 'Upto ', price: 35600, addon: 4000, warranty: true, note: { smooth: 'Fast adoption' },
        f: { smooth: 2, driving: 2, uv: 2, blue: 2, smudge: 2, scratch: 2, anti: 2 } }),
  ];

  const groups = [
    { id: 'everyday', label: 'Everyday progressive lenses' },
    { id: 'special',  label: 'Special purpose lenses' },
  ];

  const facts = {
    fitting: '*₹199 fitting charges applicable',
    warranty: '100 Days Fitting Warranty on wider lenses & above',
    code: 'FY26_PROG_016',
    rateCut: 'Rate Cut is now Live!',
    offer: { name: 'GOLD MAX', text: 'Buy 1 Get 1 + Cashback' },
  };

  // Existing real-life clips (from the lens showcase, "Real life" tab). 720x720, 6 s, loop, no audio.
  // Clicking a feature should play its clip. Paths are relative to prototype/ (use ../assets/clips/... from v1/v2/v3).
  const clips = {
    smooth:  { src: 'assets/clips/smooth-power-transition.mp4', poster: 'assets/clips/smooth-power-transition.jpg', title: 'Smooth Power Transition' },
    driving: { src: 'assets/clips/night-drive.mp4',             poster: 'assets/clips/night-drive.jpg',             title: 'Confident Driving Vision' },
    uv:      { src: 'assets/clips/uv-400.mp4',                  poster: 'assets/clips/uv-400.jpg',                  title: 'UV 400 Sun Protection' },
    blue:    { src: 'assets/clips/blue-light-block.mp4',        poster: 'assets/clips/blue-light-block.jpg',        title: 'Blue Light Block' },
    smudge:  { src: 'assets/clips/smudge-resistant.mp4',        poster: 'assets/clips/smudge-resistant.jpg',        title: 'Smudge Resistant' },
    scratch: { src: 'assets/clips/scratch-resistant.mp4',       poster: 'assets/clips/scratch-resistant.jpg',       title: 'Scratch Resistant' },
    anti:    { src: 'assets/clips/anti-glare.mp4',              poster: 'assets/clips/anti-glare.jpg',              title: 'Anti-Glare' },
    // extras that fit the lens-level story
    clarity: { src: 'assets/clips/optical-clarity.mp4',         poster: 'assets/clips/optical-clarity.jpg',         title: 'Optical clarity' },
    photo:   { src: 'assets/clips/photochromatic.mp4',          poster: 'assets/clips/photochromatic.jpg',          title: 'Photochromatic coating (add-on)' },
  };

  const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
  const byId = (id) => lenses.find((l) => l.id === id);
  const label = (l) => `${l.x}X`;
  const indexText = (l) => `${l.indexPrefix}${l.index} index`;
  // what this lens includes vs the one before it in the same ladder (for "what you get when you move up")
  const included = (l) => features.filter((f) => l.f[f.id] > 0);
  const missing = (l) => features.filter((f) => l.f[f.id] === 0);

  return { features, lenses, groups, facts, clips, inr, byId, label, indexText, included, missing };
})();
