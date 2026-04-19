const host = document.querySelector("[data-rubik-canvas]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!host) {
  throw new Error("Rubik canvas host not found.");
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("2D canvas context not available.");
}

host.appendChild(canvas);

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const cameraDistance = 13.1;
const focalLengthFactor = 2.05;
const spacing = 0.98;
const halfSize = 0.39;
const scrambledHold = 1.7;
const moveDuration = 1.05;
const movePause = 0.36;
const solvedHold = 2.4;
const animationClock = { elapsed: 0, last: performance.now() };

const makeVec = (x, y, z) => ({ x, y, z });
const addVec = (a, b) => makeVec(a.x + b.x, a.y + b.y, a.z + b.z);
const scaleVec = (v, s) => makeVec(v.x * s, v.y * s, v.z * s);
const dotVec = (a, b) => a.x * b.x + a.y * b.y + a.z * b.z;
const lenVec = (v) => Math.hypot(v.x, v.y, v.z);
const normalizeVec = (v) => {
  const length = lenVec(v) || 1;
  return makeVec(v.x / length, v.y / length, v.z / length);
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mix = (a, b, amount) => a + (b - a) * amount;
const mixRgb = (a, b, amount) => [
  Math.round(mix(a[0], b[0], amount)),
  Math.round(mix(a[1], b[1], amount)),
  Math.round(mix(a[2], b[2], amount)),
];
const rgba = (rgb, alpha) => `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${alpha})`;
const easeInOut = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;

const rotateVecX = (v, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return makeVec(v.x, v.y * c - v.z * s, v.y * s + v.z * c);
};

const rotateVecY = (v, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return makeVec(v.x * c + v.z * s, v.y, -v.x * s + v.z * c);
};

const rotateVecZ = (v, angle) => {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return makeVec(v.x * c - v.y * s, v.x * s + v.y * c, v.z);
};

const rotateVecAroundAxis = (v, axis, angle) => {
  if (axis === "x") {
    return rotateVecX(v, angle);
  }

  if (axis === "y") {
    return rotateVecY(v, angle);
  }

  return rotateVecZ(v, angle);
};

const rotateBasis = (basis, axis, angle) => ({
  x: rotateVecAroundAxis(basis.x, axis, angle),
  y: rotateVecAroundAxis(basis.y, axis, angle),
  z: rotateVecAroundAxis(basis.z, axis, angle),
});

const projectPoint = (point, width, height) => {
  const focalLength = Math.min(width, height) * focalLengthFactor;
  const depth = cameraDistance - point.z;
  const scale = focalLength / depth;

  return {
    x: width * 0.52 + point.x * scale,
    y: height * 0.5 - point.y * scale,
    depth,
  };
};

const centroid = (points) => {
  const total = points.reduce(
    (sum, point) => ({ x: sum.x + point.x, y: sum.y + point.y }),
    { x: 0, y: 0 }
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
};

const insetPolygon = (points, amount) => {
  const center = centroid(points);
  return points.map((point) => ({
    x: mix(point.x, center.x, amount),
    y: mix(point.y, center.y, amount),
  }));
};

const drawPolygon = (points) => {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
  ctx.closePath();
};

const blueToken = "blue";
const pinkToken = "pink";
const palette = {
  [blueToken]: {
    fill: [137, 188, 255],
    fillSoft: [198, 224, 255],
    shadow: [67, 98, 163],
    glow: [140, 191, 255],
  },
  [pinkToken]: {
    fill: [236, 158, 210],
    fillSoft: [255, 227, 239],
    shadow: [148, 82, 126],
    glow: [246, 177, 223],
  },
};
const neutralFace = [218, 210, 236];
const neutralShadow = [118, 104, 152];
const outline = [58, 49, 78];
const accentEdge = [243, 233, 255];
const lightDirection = normalizeVec(makeVec(-0.5, 0.76, 1));
const rimDirection = normalizeVec(makeVec(0.58, 0.16, 0.92));

const faceDefs = {
  front: {
    normal: makeVec(0, 0, 1),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 1, 0),
  },
  back: {
    normal: makeVec(0, 0, -1),
    u: makeVec(-1, 0, 0),
    v: makeVec(0, 1, 0),
  },
  right: {
    normal: makeVec(1, 0, 0),
    u: makeVec(0, 0, -1),
    v: makeVec(0, 1, 0),
  },
  left: {
    normal: makeVec(-1, 0, 0),
    u: makeVec(0, 0, 1),
    v: makeVec(0, 1, 0),
  },
  top: {
    normal: makeVec(0, 1, 0),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 0, -1),
  },
  bottom: {
    normal: makeVec(0, -1, 0),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 0, 1),
  },
};

const faceNames = Object.keys(faceDefs);
const solvedFaceTokens = {
  front: blueToken,
  back: blueToken,
  top: blueToken,
  right: pinkToken,
  left: pinkToken,
  bottom: pinkToken,
};

const createSolvedCubelets = () => {
  const cubelets = [];

  for (let y = 1; y >= -1; y -= 1) {
    for (let z = -1; z <= 1; z += 1) {
      for (let x = -1; x <= 1; x += 1) {
        const stickers = {};

        if (z === 1) {
          stickers.front = solvedFaceTokens.front;
        }
        if (z === -1) {
          stickers.back = solvedFaceTokens.back;
        }
        if (x === 1) {
          stickers.right = solvedFaceTokens.right;
        }
        if (x === -1) {
          stickers.left = solvedFaceTokens.left;
        }
        if (y === 1) {
          stickers.top = solvedFaceTokens.top;
        }
        if (y === -1) {
          stickers.bottom = solvedFaceTokens.bottom;
        }

        cubelets.push({
          coord: { x, y, z },
          stickers,
        });
      }
    }
  }

  return cubelets;
};

const cloneCubelets = (cubelets) =>
  cubelets.map((cubelet) => ({
    coord: { ...cubelet.coord },
    stickers: { ...cubelet.stickers },
  }));

const rotateDiscreteVec = (v, axis, dir) => {
  if (axis === "x") {
    return dir === 1
      ? makeVec(v.x, -v.z, v.y)
      : makeVec(v.x, v.z, -v.y);
  }

  if (axis === "y") {
    return dir === 1
      ? makeVec(v.z, v.y, -v.x)
      : makeVec(-v.z, v.y, v.x);
  }

  return dir === 1
    ? makeVec(-v.y, v.x, v.z)
    : makeVec(v.y, -v.x, v.z);
};

const faceFromNormal = (normal) => {
  if (normal.z === 1) {
    return "front";
  }
  if (normal.z === -1) {
    return "back";
  }
  if (normal.x === 1) {
    return "right";
  }
  if (normal.x === -1) {
    return "left";
  }
  if (normal.y === 1) {
    return "top";
  }
  return "bottom";
};

const applyMove = (cubelets, move) =>
  cubelets.map((cubelet) => {
    if (cubelet.coord[move.axis] !== move.layer) {
      return {
        coord: { ...cubelet.coord },
        stickers: { ...cubelet.stickers },
      };
    }

    const rotatedCoord = rotateDiscreteVec(cubelet.coord, move.axis, move.dir);
    const rotatedStickers = {};

    Object.entries(cubelet.stickers).forEach(([faceName, token]) => {
      const rotatedNormal = rotateDiscreteVec(faceDefs[faceName].normal, move.axis, move.dir);
      rotatedStickers[faceFromNormal(rotatedNormal)] = token;
    });

    return {
      coord: rotatedCoord,
      stickers: rotatedStickers,
    };
  });

const invertMove = (move) => ({
  axis: move.axis,
  layer: move.layer,
  dir: -move.dir,
});

const scrambleMoves = [
  { axis: "y", layer: 1, dir: 1 },
  { axis: "x", layer: 1, dir: -1 },
  { axis: "z", layer: 1, dir: 1 },
  { axis: "y", layer: 1, dir: 1 },
  { axis: "x", layer: 1, dir: 1 },
  { axis: "z", layer: 1, dir: -1 },
];
const solveMoves = [...scrambleMoves].reverse().map(invertMove);

const solvedCubelets = createSolvedCubelets();
const scrambledCubelets = scrambleMoves.reduce(
  (cubelets, move) => applyMove(cubelets, move),
  cloneCubelets(solvedCubelets)
);
const solveStates = [cloneCubelets(scrambledCubelets)];

solveMoves.forEach((move) => {
  solveStates.push(applyMove(solveStates[solveStates.length - 1], move));
});

const solveTimelineDuration =
  scrambledHold +
  solveMoves.length * moveDuration +
  Math.max(0, solveMoves.length - 1) * movePause +
  solvedHold;

const getTimelineState = (elapsed) => {
  if (reducedMotion) {
    return {
      cubelets: solveStates[solveStates.length - 1],
      activeMove: null,
      moveProgress: 1,
      completion: 1,
    };
  }

  let time = Math.min(elapsed, solveTimelineDuration);

  if (time < scrambledHold) {
    return {
      cubelets: solveStates[0],
      activeMove: null,
      moveProgress: 0,
      completion: 0,
    };
  }

  time -= scrambledHold;

  for (let index = 0; index < solveMoves.length; index += 1) {
    if (time < moveDuration) {
      return {
        cubelets: solveStates[index],
        activeMove: solveMoves[index],
        moveProgress: easeInOut(time / moveDuration),
        completion: clamp((index + time / moveDuration) / solveMoves.length, 0, 1),
      };
    }

    time -= moveDuration;

    if (index < solveMoves.length - 1 && time < movePause) {
      return {
        cubelets: solveStates[index + 1],
        activeMove: null,
        moveProgress: 1,
        completion: (index + 1) / solveMoves.length,
      };
    }

    if (index < solveMoves.length - 1) {
      time -= movePause;
    }
  }

  return {
    cubelets: solveStates[solveStates.length - 1],
    activeMove: null,
    moveProgress: 1,
    completion: 1,
  };
};

const getFacePalette = (token, faceName, completion, light, rim) => {
  const tones = palette[token];
  const solvedBoost = token === solvedFaceTokens[faceName] ? completion : 0;
  const baseFill = mixRgb(neutralFace, tones.fill, 0.7);
  const fill = mixRgb(baseFill, tones.fillSoft, clamp(light * 0.12 + solvedBoost * 0.18, 0, 0.24));
  const shadow = mixRgb(neutralShadow, tones.shadow, 0.56 + solvedBoost * 0.24);
  const highlight = mixRgb(accentEdge, tones.fillSoft, solvedBoost * 0.32);
  const stroke = mixRgb(outline, tones.shadow, solvedBoost * 0.24);
  const glow = clamp(solvedBoost * (0.62 + rim * 0.22), 0, 1);

  return { fill, shadow, highlight, stroke, glow };
};

const drawFace = (face) => {
  const { points, faceName, light, rim, completion, token, visibility } = face;
  const paletteForFace = getFacePalette(token, faceName, completion, light, rim);
  const innerPoints = insetPolygon(points, 0.12);
  const center = centroid(points);
  const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[2].x, points[2].y);

  gradient.addColorStop(0, rgba(paletteForFace.highlight, 0.95 * visibility));
  gradient.addColorStop(0.42, rgba(paletteForFace.fill, 0.98 * visibility));
  gradient.addColorStop(1, rgba(paletteForFace.shadow, 0.92 * visibility));

  ctx.save();
  drawPolygon(points);
  ctx.fillStyle = gradient;
  if (paletteForFace.glow > 0.01) {
    ctx.shadowColor = rgba(palette[token].glow, 0.18 + paletteForFace.glow * 0.24);
    ctx.shadowBlur = 12 + paletteForFace.glow * 16;
  }
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawPolygon(points);
  ctx.strokeStyle = rgba(paletteForFace.stroke, 0.42 + paletteForFace.glow * 0.12);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  drawPolygon(innerPoints);
  const innerGradient = ctx.createLinearGradient(points[0].x, points[0].y, center.x, center.y);
  innerGradient.addColorStop(0, rgba([255, 255, 255], 0.16 + paletteForFace.glow * 0.08));
  innerGradient.addColorStop(1, rgba(paletteForFace.fill, 0.06));
  ctx.fillStyle = innerGradient;
  ctx.fill();
  ctx.restore();
};

const renderCube = () => {
  const width = host.clientWidth;
  const height = host.clientHeight;

  if (!width || !height) {
    return;
  }

  if (canvas.width !== Math.round(width * DPR) || canvas.height !== Math.round(height * DPR)) {
    canvas.width = Math.round(width * DPR);
    canvas.height = Math.round(height * DPR);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
  }

  ctx.clearRect(0, 0, width, height);

  const timeline = getTimelineState(animationClock.elapsed);
  const orbitY = 0.74 + Math.sin(animationClock.elapsed * 0.24) * 0.18;
  const orbitX = -0.54 + Math.sin(animationClock.elapsed * 0.16 + 0.6) * 0.08;
  const orbitZ = Math.sin(animationClock.elapsed * 0.12) * 0.03;
  const lift = Math.sin(animationClock.elapsed * 0.82) * 0.14 * (1 - timeline.completion * 0.35);
  const facesToDraw = [];

  timeline.cubelets.forEach((cubelet) => {
    let position = scaleVec(cubelet.coord, spacing);
    let basis = {
      x: makeVec(1, 0, 0),
      y: makeVec(0, 1, 0),
      z: makeVec(0, 0, 1),
    };

    if (timeline.activeMove && cubelet.coord[timeline.activeMove.axis] === timeline.activeMove.layer) {
      const angle = timeline.activeMove.dir * (Math.PI / 2) * timeline.moveProgress;
      position = rotateVecAroundAxis(position, timeline.activeMove.axis, angle);
      basis = rotateBasis(basis, timeline.activeMove.axis, angle);
    }

    position = addVec(position, makeVec(0, lift, 0));
    position = rotateVecY(position, orbitY);
    basis = rotateBasis(basis, "y", orbitY);
    position = rotateVecX(position, orbitX);
    basis = rotateBasis(basis, "x", orbitX);
    position = rotateVecZ(position, orbitZ);
    basis = rotateBasis(basis, "z", orbitZ);

    Object.entries(cubelet.stickers).forEach(([faceName, token]) => {
      const faceDef = faceDefs[faceName];
      const normal = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, faceDef.normal.x), scaleVec(basis.y, faceDef.normal.y)),
          scaleVec(basis.z, faceDef.normal.z)
        )
      );

      if (normal.z <= 0.04) {
        return;
      }

      const u = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, faceDef.u.x), scaleVec(basis.y, faceDef.u.y)),
          scaleVec(basis.z, faceDef.u.z)
        )
      );
      const v = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, faceDef.v.x), scaleVec(basis.y, faceDef.v.y)),
          scaleVec(basis.z, faceDef.v.z)
        )
      );

      const center = addVec(position, scaleVec(normal, halfSize));
      const verts3d = [
        addVec(addVec(center, scaleVec(u, -halfSize)), scaleVec(v, -halfSize)),
        addVec(addVec(center, scaleVec(u, halfSize)), scaleVec(v, -halfSize)),
        addVec(addVec(center, scaleVec(u, halfSize)), scaleVec(v, halfSize)),
        addVec(addVec(center, scaleVec(u, -halfSize)), scaleVec(v, halfSize)),
      ];
      const projected = verts3d.map((point) => projectPoint(point, width, height));
      const avgZ = verts3d.reduce((sum, point) => sum + point.z, 0) / 4;
      const light = clamp(dotVec(normal, lightDirection), 0, 1);
      const rim = clamp(dotVec(normal, rimDirection), 0, 1);

      facesToDraw.push({
        points: projected,
        depth: avgZ,
        faceName,
        token,
        light,
        rim,
        completion: timeline.completion,
        visibility: 0.92 + light * 0.08,
      });
    });
  });

  facesToDraw.sort((a, b) => a.depth - b.depth).forEach(drawFace);
};

const tick = (now) => {
  const delta = Math.min((now - animationClock.last) / 1000, 0.05);
  animationClock.last = now;

  if (!reducedMotion) {
    animationClock.elapsed += delta;
  } else {
    animationClock.elapsed = solveTimelineDuration;
  }

  renderCube();
  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
