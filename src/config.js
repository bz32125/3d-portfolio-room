// Përmasat e dhomës në metra (1 unit = 1 m).
// Matje të përafërta nga besniku, 2026-11-06.
export const ROOM = {
  width: 5, // boshti X: përgjatë murit me rafte
  depth: 7, // boshti Z: përgjatë murit me dritare
  height: 3.15, // boshti Y: nga dyshemeja te tavani
};

// Tavani i ulur anash (soffit) me LED, si në foto.
export const SOFFIT = {
  bottom: 2.6, // lartësia e pjesës së poshtme; raftet arrijnë deri këtu
  band: 0.6, // sa del korniza nga muri
};

// Muri me rafte (i matur nga besniku): 3.85 × 2.60 × 0.36 m.
// Dy kulla me 3 kolona secila, me tavolinën në mes.
export const WALL_UNIT = {
  width: 3.85,
  height: 2.6,
  depth: 0.36,
  columnWidth: 0.4, // 3 kolona × 0.40 = 1.20 m për kullë
  plinth: 0.08, // baza e zezë
  board: 0.02, // trashësia e dërrasave
  shelfSpacing: 0.315, // distanca mes rafteve
  deskTop: 0.78, // qendra e pllakës së tavolinës
  deskThickness: 0.04,
  deskDepth: 0.6,
};

// Kufijtë e dhomës, të llogaritur një herë që të mos i përsërisim kudo.
// Origjina (0, 0, 0) është në qendër të dyshemesë.
export const BOUNDS = {
  left: -ROOM.width / 2, // x = -2.5  (gardëroba)
  right: ROOM.width / 2, // x = +2.5  (dritarja)
  back: -ROOM.depth / 2, // z = -3.5  (muri me rafte)
  front: ROOM.depth / 2, // z = +3.5  (nga u bë fotoja e gjerë)
};
