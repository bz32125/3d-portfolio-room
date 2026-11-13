// Përmasat e dhomës në metra (1 unit = 1 m).
// Matje të përafërta nga besniku, 2026-11-06.
export const ROOM = {
  width: 5, // boshti X: përgjatë murit me rafte
  depth: 7, // boshti Z: përgjatë murit me dritare
  height: 3.15, // boshti Y: nga dyshemeja te tavani
};

// Kufijtë e dhomës, të llogaritur një herë që të mos i përsërisim kudo.
// Origjina (0, 0, 0) është në qendër të dyshemesë.
export const BOUNDS = {
  left: -ROOM.width / 2, // x = -2.5  (gardëroba)
  right: ROOM.width / 2, // x = +2.5  (dritarja)
  back: -ROOM.depth / 2, // z = -3.5  (muri me rafte)
  front: ROOM.depth / 2, // z = +3.5  (nga u bë fotoja e gjerë)
};
