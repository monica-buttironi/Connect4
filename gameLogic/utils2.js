function convertFromBoardCoordinates(_x, _y, _z) {
  return {
    x: _x * 2 - 3,
    y: _y + 1,
    z: _z * 2 - 3,
  };
}

function calcNextY(x, z, state) {
  return state.filter((s) => s.x === x && s.z === z).length;
}

function checkEndConditions(state) {
  if (state.length < 1) return false;

  const lastColor = state[state.length - 1].color;
  const winningCandidate = state.filter((p) => p.color === lastColor);

  // on planar axes
  let byXZ = _.groupBy(winningCandidate, (c) => [c.x, c.z]);
  let byXY = _.groupBy(winningCandidate, (c) => [c.x, c.y]);
  let byYZ = _.groupBy(winningCandidate, (c) => [c.y, c.z]);

  const maxXZ = _.max(Object.values(byXZ).map((group) => group.length));
  const maxXY = _.max(Object.values(byXY).map((group) => group.length));
  const maxYZ = _.max(Object.values(byYZ).map((group) => group.length));

  if (maxXY === 4 || maxXZ === 4 || maxYZ === 4) {
    return true;
  }

  //on planar diagonals
  let byX = _.groupBy(winningCandidate, (c) => c.x);
  let byY = _.groupBy(winningCandidate, (c) => c.y);
  let byZ = _.groupBy(winningCandidate, (c) => c.z);

  let onDiagonalX = _.max(
    Object.values(byX).map((group) => group.filter((c) => c.z === c.y).length)
  );
  let onInverseDiagonalX = _.max(
    Object.values(byX).map(
      (group) => group.filter((c) => c.z === 3 - c.y).length
    )
  );
  let onDiagonalY = _.max(
    Object.values(byY).map((group) => group.filter((c) => c.x === c.z).length)
  );
  let onInverseDiagonalY = _.max(
    Object.values(byY).map(
      (group) => group.filter((c) => c.x === 3 - c.z).length
    )
  );
  let onDiagonalZ = _.max(
    Object.values(byZ).map((group) => group.filter((c) => c.y === c.x).length)
  );
  let onInverseDiagonalZ = _.max(
    Object.values(byZ).map(
      (group) => group.filter((c) => c.y === 3 - c.x).length
    )
  );

  if (
    onDiagonalX === 4 ||
    onInverseDiagonalX === 4 ||
    onDiagonalY === 4 ||
    onInverseDiagonalY === 4 ||
    onDiagonalZ === 4 ||
    onInverseDiagonalZ === 4
  ) {
    return true;
  }

  // on cube diagonals
  // x = y = z
  const sameXYZ = winningCandidate.filter(
    (c) => c.x === c.y && c.y === c.z
  ).length;
  // x = 3 - y && y = z
  const sameYZ = winningCandidate.filter(
    (c) => c.x === 3 - c.y && c.y === c.z
  ).length;
  // x = z && y = 3 - x
  const sameXZ = winningCandidate.filter(
    (c) => c.y === 3 - c.x && c.x === c.z
  ).length;
  // x = y && z = 3 - x
  const sameXY = winningCandidate.filter(
    (c) => c.z === 3 - c.x && c.x === c.y
  ).length;

  if (sameXYZ === 4 || sameXY === 4 || sameXZ === 4 || sameYZ === 4) {
    return true;
  }

  return false;
}
