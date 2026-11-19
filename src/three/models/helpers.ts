import * as THREE from 'three';
import type { MaterialPalette } from '../materials';

export interface ComponentPartEntry {
  id: string;
  group: THREE.Group;
  basePos: THREE.Vector3;
  explodeOffset: THREE.Vector3;
  labelAnchor: THREE.Vector3;
  arrowLine?: THREE.Line;
}

export interface BuiltHardwareModel {
  root: THREE.Group;
  parts: Map<string, ComponentPartEntry>;
  interactables: THREE.Object3D[];
  animatedExtra?: {
    lidGroup?: THREE.Group;
    doorGroup?: THREE.Group;
    fanRotors?: THREE.Group[];
  };
  dispose: () => void;
}

export function registerComponentPart(
  parts: Map<string, ComponentPartEntry>,
  interactables: THREE.Object3D[],
  id: string,
  group: THREE.Group,
  basePos: [number, number, number],
  explodeOffset: [number, number, number],
  labelAnchor: [number, number, number] = [0, 0, 0],
): ComponentPartEntry {
  group.position.set(basePos[0], basePos[1], basePos[2]);
  group.userData.componentId = id;
  group.traverse((child) => {
    child.userData.componentId = id;
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.layers.enable(1);
    }
  });
  interactables.push(group);

  const entry: ComponentPartEntry = {
    id,
    group,
    basePos: new THREE.Vector3(...basePos),
    explodeOffset: new THREE.Vector3(...explodeOffset),
    labelAnchor: new THREE.Vector3(...labelAnchor),
  };
  parts.set(id, entry);
  return entry;
}

export function createFanAssembly(
  size: number,
  thickness: number,
  mats: MaterialPalette,
  bladeCount = 7,
  withLedRing = false,
): { group: THREE.Group; rotor: THREE.Group } {
  const group = new THREE.Group();
  const half = size / 2;

  // Frame (4 bars around perimeter)
  const barThick = size * 0.1;
  const hBar = new THREE.BoxGeometry(size, barThick, thickness);
  const vBar = new THREE.BoxGeometry(barThick, size - barThick * 2, thickness);

  const top = new THREE.Mesh(hBar, mats.matteBlackPlastic);
  top.position.y = half - barThick / 2;
  const bottom = new THREE.Mesh(hBar, mats.matteBlackPlastic);
  bottom.position.y = -half + barThick / 2;
  const left = new THREE.Mesh(vBar, mats.matteBlackPlastic);
  left.position.x = -half + barThick / 2;
  const right = new THREE.Mesh(vBar, mats.matteBlackPlastic);
  right.position.x = half - barThick / 2;
  group.add(top, bottom, left, right);

  // Corner mounting bosses
  const cornerGeo = new THREE.BoxGeometry(barThick * 1.15, barThick * 1.15, thickness * 1.04);
  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) {
      const corner = new THREE.Mesh(cornerGeo, mats.rubber);
      corner.position.set(sx * (half - barThick * 0.6), sy * (half - barThick * 0.6), 0);
      group.add(corner);
    }
  }

  if (withLedRing) {
    const ringGeo = new THREE.TorusGeometry(half * 0.8, thickness * 0.1, 8, 24);
    const ring = new THREE.Mesh(ringGeo, mats.ledBlue);
    ring.position.z = thickness * 0.45;
    group.add(ring);
  }

  // Rotor hub & angled blades
  const rotor = new THREE.Group();
  const hubGeo = new THREE.CylinderGeometry(size * 0.18, size * 0.18, thickness * 0.72, 16);
  hubGeo.rotateX(Math.PI / 2);
  const hub = new THREE.Mesh(hubGeo, mats.chassisSteel);
  rotor.add(hub);

  const bladeLen = size * 0.28;
  const bladeGeo = new THREE.BoxGeometry(bladeLen, size * 0.085, thickness * 0.14);
  for (let i = 0; i < bladeCount; i++) {
    const angle = (i / bladeCount) * Math.PI * 2;
    const pivot = new THREE.Group();
    pivot.rotation.z = angle;
    const blade = new THREE.Mesh(bladeGeo, mats.fanBlade);
    blade.position.x = size * 0.28;
    blade.rotation.x = 0.48;
    pivot.add(blade);
    rotor.add(pivot);
  }

  group.add(rotor);
  return { group, rotor };
}

export function createTubeCable(
  points: [number, number, number][],
  radius: number,
  material: THREE.Material,
  tubularSegments = 20,
): THREE.Mesh {
  const curve = new THREE.CatmullRomCurve3(
    points.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
  );
  const geo = new THREE.TubeGeometry(curve, tubularSegments, radius, 8, false);
  return new THREE.Mesh(geo, material);
}

export function createHeatsinkFins(
  width: number,
  height: number,
  depth: number,
  finCount: number,
  material: THREE.Material,
): THREE.Group {
  const group = new THREE.Group();
  const finThick = Math.min(0.015, (depth / finCount) * 0.35);
  const finGeo = new THREE.BoxGeometry(width, height, finThick);
  for (let i = 0; i < finCount; i++) {
    const t = finCount === 1 ? 0 : i / (finCount - 1) - 0.5;
    const fin = new THREE.Mesh(finGeo, material);
    fin.position.z = t * depth;
    group.add(fin);
  }
  return group;
}

export function createBeveledPlateGeometry(
  width: number,
  height: number,
  depth: number,
  bevel = 0.02,
): THREE.ExtrudeGeometry {
  const hw = width / 2 - bevel;
  const hh = height / 2 - bevel;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hh);
  shape.lineTo(hw, -hh);
  shape.lineTo(hw, hh);
  shape.lineTo(-hw, hh);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, depth - bevel * 2),
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

export function disposeGroupResources(root: THREE.Group) {
  const geometries = new Set<THREE.BufferGeometry>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      geometries.add(mesh.geometry);
    }
  });
  geometries.forEach((g) => g.dispose());
}
