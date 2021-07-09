function convertFromBoardCoordinates(_x,_y,_z) {
  return {
    x: (_x * 2) -3,
    y: _y + 1,
    z: (_z * 2) -3,
  }
}

function calcNextY(x, z, state) {
  return state
    .filter((s) => (s.x === x && s.z === z))
    .length
}