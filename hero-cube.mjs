const host = document.querySelector("[data-hero-cube]");
const hero = document.querySelector(".hero");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!host || !hero) {
  throw new Error("Hero cube host not found.");
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("2D canvas context not available.");
}

host.appendChild(canvas);

const DPR = Math.min(window.devicePixelRatio || 1, 2);
const TAU = Math.PI * 2;
const cameraDistance = 13.4;
const focalLength = 860;
const spacing = 0.96;
const halfSize = 0.37;
const animationClock = { elapsed: 0, last: performance.now(), delta: 0 };
let currentAssembly = reducedMotion ? 1 : 0;

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
const hashCoord = (x, y, z) => {
  const value = Math.sin(x * 19.23 + y * 8.71 + z * 13.17) * 43758.5453;
  return value - Math.floor(value);
};
const hashString = (text) => {
  let hash = 2166136261;

  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return ((hash >>> 0) % 10000) / 10000;
};

const purple = [179, 120, 255];
const purpleSoft = [219, 194, 255];
const purpleDeep = [103, 67, 158];
const blue = [114, 168, 255];
const blueSoft = [187, 217, 255];
const blueDeep = [67, 103, 163];
const outline = [43, 36, 62];
const shadowTone = [8, 10, 20];
const glassShadow = [55, 44, 84];
const lightDirection = normalizeVec(makeVec(-0.5, 0.74, 1));
const rimDirection = normalizeVec(makeVec(0.62, 0.18, 0.92));
const solvedFaceColors = {
  front: purple,
  right: blue,
  top: purple,
  left: blue,
  back: purple,
  bottom: blue,
};
const scramblePalette = [purple, blue];

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
  const depth = cameraDistance - point.z;
  const scale = focalLength / depth;

  return {
    x: width * 0.5 + point.x * scale,
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

const cubelets = [];

for (let y = 1; y >= -1; y -= 1) {
  for (let z = -1; z <= 1; z += 1) {
    for (let x = -1; x <= 1; x += 1) {
      const seed = hashCoord(x, y, z);
      const direction = normalizeVec(
        makeVec(
          x === 0 ? (seed - 0.5) * 0.9 : x,
          y === 0 ? (seed - 0.5) * 0.82 : y * 1.05,
          z === 0 ? (seed - 0.5) * 0.86 : z
        )
      );

      cubelets.push({
        home: { x, y, z },
        seed,
        offset: makeVec(
          direction.x * (0.44 + seed * 0.26),
          direction.y * (0.34 + seed * 0.22),
          direction.z * (0.4 + seed * 0.26)
        ),
        rotation: makeVec(
          (seed - 0.5) * 0.64,
          (hashCoord(x + 2, y + 5, z + 8) - 0.5) * 0.86,
          (hashCoord(x + 6, y + 3, z + 1) - 0.5) * 0.48
        ),
        delay:
          ((1 - z) * 0.05 + (1 - y) * 0.032 + Math.abs(x) * 0.018 + seed * 0.02),
      });
    }
  }
}

const faces = [
  {
    name: "front",
    normal: makeVec(0, 0, 1),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 1, 0),
    isOuter: (coord) => coord.z === 1,
  },
  {
    name: "back",
    normal: makeVec(0, 0, -1),
    u: makeVec(-1, 0, 0),
    v: makeVec(0, 1, 0),
    isOuter: (coord) => coord.z === -1,
  },
  {
    name: "right",
    normal: makeVec(1, 0, 0),
    u: makeVec(0, 0, -1),
    v: makeVec(0, 1, 0),
    isOuter: (coord) => coord.x === 1,
  },
  {
    name: "left",
    normal: makeVec(-1, 0, 0),
    u: makeVec(0, 0, 1),
    v: makeVec(0, 1, 0),
    isOuter: (coord) => coord.x === -1,
  },
  {
    name: "top",
    normal: makeVec(0, 1, 0),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 0, -1),
    isOuter: (coord) => coord.y === 1,
  },
  {
    name: "bottom",
    normal: makeVec(0, -1, 0),
    u: makeVec(1, 0, 0),
    v: makeVec(0, 0, 1),
    isOuter: (coord) => coord.y === -1,
  },
];

const scrambleColorFor = (faceName, coord) => {
  const key = `${faceName}:${coord.x}:${coord.y}:${coord.z}`;
  const index = Math.floor(hashString(key) * scramblePalette.length) % scramblePalette.length;
  return scramblePalette[index];
};

const facePalette = (faceName, light, solvedStrength, coord) => {
  const scrambledBase = scrambleColorFor(faceName, coord);
  const solvedBase = solvedFaceColors[faceName];
  const fillBase = mixRgb(scrambledBase, solvedBase, solvedStrength);
  const isBlue = solvedBase === blue;
  const solvedHighlight = isBlue ? blueSoft : purpleSoft;
  const solvedShadow = isBlue ? blueDeep : purpleDeep;

  return {
    fill: mixRgb(fillBase, [255, 255, 255], clamp(light * 0.1, 0, 0.1)),
    shadow: mixRgb(glassShadow, solvedShadow, solvedStrength * 0.72),
    highlight: mixRgb([255, 255, 255], solvedHighlight, solvedStrength * 0.42),
    stroke: mixRgb(outline, solvedBase, solvedStrength * 0.24),
    glow: solvedStrength * (faceName === "front" || faceName === "right" || faceName === "top" ? 1 : 0.38),
  };
};

const drawFace = (face) => {
  const { points, faceName, light, solvedStrength, visibility, coord } = face;
  const palette = facePalette(faceName, light, solvedStrength, coord);
  const innerPoints = insetPolygon(points, 0.12);
  const center = centroid(points);
  const gradient = ctx.createLinearGradient(points[0].x, points[0].y, points[2].x, points[2].y);

  gradient.addColorStop(0, rgba(palette.highlight, 0.96 * visibility));
  gradient.addColorStop(0.42, rgba(palette.fill, 0.98 * visibility));
  gradient.addColorStop(1, rgba(palette.shadow, 0.92 * visibility));

  ctx.save();
  drawPolygon(points);
  ctx.fillStyle = gradient;
  if (palette.glow > 0.01) {
    ctx.shadowColor = rgba(palette.highlight, 0.16 + palette.glow * 0.2);
    ctx.shadowBlur = 10 + palette.glow * 14;
  }
  ctx.fill();
  ctx.restore();

  ctx.save();
  drawPolygon(points);
  ctx.strokeStyle = rgba(palette.stroke, 0.44 + palette.glow * 0.12);
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  drawPolygon(innerPoints);
  const innerGradient = ctx.createLinearGradient(points[0].x, points[0].y, center.x, center.y);
  innerGradient.addColorStop(0, rgba([255, 255, 255], 0.15 + palette.glow * 0.06));
  innerGradient.addColorStop(1, rgba(palette.fill, 0.05));
  ctx.fillStyle = innerGradient;
  ctx.fill();
  ctx.restore();
};

const getTargetAssembly = () => {
  if (reducedMotion) {
    return 1;
  }

  const start = hero.offsetTop;
  const span = Math.max(hero.offsetHeight * 0.72, window.innerHeight * 0.72);
  return clamp((window.scrollY - start) / span, 0, 1);
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

  const targetAssembly = getTargetAssembly();
  const assemblyEase = reducedMotion ? 1 : 1 - Math.exp(-animationClock.delta * 8.5);
  currentAssembly += (targetAssembly - currentAssembly) * assemblyEase;

  const orbitY = 0.72 + Math.sin(animationClock.elapsed * 0.16) * (0.08 - currentAssembly * 0.05);
  const orbitX = -0.48 + Math.sin(animationClock.elapsed * 0.1 + 0.8) * (0.04 - currentAssembly * 0.026);
  const orbitZ = Math.sin(animationClock.elapsed * 0.09) * (0.018 - currentAssembly * 0.012);
  const facesToDraw = [];

  cubelets.forEach((cubelet) => {
    const localAssembly = easeInOut(
      clamp((currentAssembly - cubelet.delay) / (1 - cubelet.delay * 0.78), 0, 1)
    );
    const floatStrength = 1 - localAssembly;
    const drift = makeVec(
      Math.sin(animationClock.elapsed * 1.02 + cubelet.seed * TAU) * 0.032 * floatStrength,
      Math.cos(animationClock.elapsed * 0.88 + cubelet.seed * TAU * 0.84) * 0.026 * floatStrength,
      Math.sin(animationClock.elapsed * 0.92 + cubelet.seed * TAU * 1.14) * 0.03 * floatStrength
    );

    let position = addVec(
      makeVec(cubelet.home.x, cubelet.home.y, cubelet.home.z),
      addVec(scaleVec(cubelet.offset, 1 - localAssembly), drift)
    );
    let basis = {
      x: makeVec(1, 0, 0),
      y: makeVec(0, 1, 0),
      z: makeVec(0, 0, 1),
    };

    basis = rotateBasis(basis, "x", cubelet.rotation.x * (1 - localAssembly));
    basis = rotateBasis(basis, "y", cubelet.rotation.y * (1 - localAssembly));
    basis = rotateBasis(basis, "z", cubelet.rotation.z * (1 - localAssembly));

    position = scaleVec(position, spacing);
    position = rotateVecY(position, orbitY);
    basis = rotateBasis(basis, "y", orbitY);
    position = rotateVecX(position, orbitX);
    basis = rotateBasis(basis, "x", orbitX);
    position = rotateVecZ(position, orbitZ);
    basis = rotateBasis(basis, "z", orbitZ);

    faces.forEach((face) => {
      if (!face.isOuter(cubelet.home)) {
        return;
      }

      const normal = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, face.normal.x), scaleVec(basis.y, face.normal.y)),
          scaleVec(basis.z, face.normal.z)
        )
      );

      if (normal.z <= 0.05) {
        return;
      }

      const u = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, face.u.x), scaleVec(basis.y, face.u.y)),
          scaleVec(basis.z, face.u.z)
        )
      );
      const v = normalizeVec(
        addVec(
          addVec(scaleVec(basis.x, face.v.x), scaleVec(basis.y, face.v.y)),
          scaleVec(basis.z, face.v.z)
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
      const solvedStrength = clamp(localAssembly * (0.84 + rim * 0.16), 0, 1);

      facesToDraw.push({
        points: projected,
        depth: avgZ,
        faceName: face.name,
        light,
        solvedStrength,
        visibility: 0.92 + light * 0.08 + currentAssembly * 0.03,
        coord: cubelet.home,
      });
    });
  });

  facesToDraw
    .sort((a, b) => a.depth - b.depth)
    .forEach((face) => drawFace(face));
};

const tick = (now) => {
  const delta = Math.min((now - animationClock.last) / 1000, 0.05);
  animationClock.last = now;
  animationClock.delta = delta;
  animationClock.elapsed += reducedMotion ? 0 : delta;

  renderCube();
  requestAnimationFrame(tick);
};

requestAnimationFrame(tick);
