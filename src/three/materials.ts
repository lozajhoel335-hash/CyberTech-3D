import * as THREE from 'three';
import {
  createBrushedMetalBumpTexture,
  createMeshGrilleTexture,
  createPcbTexture,
} from './textures';

export interface MaterialPalette {
  chassisDark: THREE.MeshStandardMaterial;
  chassisSteel: THREE.MeshStandardMaterial;
  chassisMesh: THREE.MeshStandardMaterial;
  temperedGlass: THREE.MeshPhysicalMaterial;
  pcbDarkBlue: THREE.MeshStandardMaterial;
  pcbGreen: THREE.MeshStandardMaterial;
  aluminum: THREE.MeshStandardMaterial;
  brushedSilver: THREE.MeshStandardMaterial;
  copper: THREE.MeshStandardMaterial;
  gold: THREE.MeshStandardMaterial;
  matteBlackPlastic: THREE.MeshStandardMaterial;
  glossyBlack: THREE.MeshStandardMaterial;
  fanBlade: THREE.MeshStandardMaterial;
  blueAccent: THREE.MeshStandardMaterial;
  ledBlue: THREE.MeshStandardMaterial;
  amberAccent: THREE.MeshStandardMaterial;
  redCable: THREE.MeshStandardMaterial;
  chrome: THREE.MeshStandardMaterial;
  rubber: THREE.MeshStandardMaterial;
  dispose: () => void;
}

export function createMaterialPalette(
  isSoftwareGl: boolean,
  maxAnisotropy: number,
): MaterialPalette {
  const pcbTex = createPcbTexture('#0B2239', '#1E5288', '#94A3B8', maxAnisotropy);
  const pcbGreenTex = createPcbTexture('#0D3025', '#1B664E', '#A7F3D0', maxAnisotropy);
  const brushedBump = createBrushedMetalBumpTexture(maxAnisotropy);
  const meshTex = createMeshGrilleTexture(maxAnisotropy);

  const materials: THREE.Material[] = [];
  const track = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const chassisDark = track(
    new THREE.MeshStandardMaterial({
      color: 0x151d2c,
      roughness: 0.72,
      metalness: 0.35,
    }),
  );

  const chassisSteel = track(
    new THREE.MeshStandardMaterial({
      color: 0x222c3f,
      roughness: 0.55,
      metalness: 0.6,
      bumpMap: brushedBump,
      bumpScale: 0.008,
    }),
  );

  const chassisMesh = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: meshTex,
      roughness: 0.78,
      metalness: 0.25,
    }),
  );

  const temperedGlass = track(
    new THREE.MeshPhysicalMaterial({
      color: 0xaad4ff,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.84,
      transparent: true,
      opacity: isSoftwareGl ? 0.28 : 0.92,
      ior: 1.5,
      thickness: 0.12,
      depthWrite: false,
    }),
  );

  const pcbDarkBlue = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: pcbTex,
      roughness: 0.52,
      metalness: 0.12,
    }),
  );

  const pcbGreen = track(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: pcbGreenTex,
      roughness: 0.54,
      metalness: 0.12,
    }),
  );

  const aluminum = track(
    new THREE.MeshStandardMaterial({
      color: 0xb8c4d4,
      roughness: 0.28,
      metalness: 0.86,
      bumpMap: brushedBump,
      bumpScale: 0.01,
    }),
  );

  const brushedSilver = track(
    new THREE.MeshStandardMaterial({
      color: 0xd9e2ec,
      roughness: 0.22,
      metalness: 0.92,
      bumpMap: brushedBump,
      bumpScale: 0.006,
    }),
  );

  const copper = track(
    new THREE.MeshStandardMaterial({
      color: 0xd97736,
      roughness: 0.24,
      metalness: 0.9,
    }),
  );

  const gold = track(
    new THREE.MeshStandardMaterial({
      color: 0xe6b84c,
      roughness: 0.2,
      metalness: 0.94,
    }),
  );

  const matteBlackPlastic = track(
    new THREE.MeshStandardMaterial({
      color: 0x161b24,
      roughness: 0.82,
      metalness: 0.06,
    }),
  );

  const glossyBlack = track(
    new THREE.MeshStandardMaterial({
      color: 0x0b0f17,
      roughness: 0.16,
      metalness: 0.2,
    }),
  );

  const fanBlade = track(
    new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.36,
      metalness: 0.18,
    }),
  );

  const blueAccent = track(
    new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.3,
    }),
  );

  const ledBlue = track(
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.25,
      roughness: 0.25,
      metalness: 0.1,
    }),
  );

  const amberAccent = track(
    new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.42,
      metalness: 0.22,
    }),
  );

  const redCable = track(
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.58,
      metalness: 0.05,
    }),
  );

  const chrome = track(
    new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.12,
      metalness: 0.96,
    }),
  );

  const rubber = track(
    new THREE.MeshStandardMaterial({
      color: 0x1c222d,
      roughness: 0.9,
      metalness: 0.02,
    }),
  );

  return {
    chassisDark,
    chassisSteel,
    chassisMesh,
    temperedGlass,
    pcbDarkBlue,
    pcbGreen,
    aluminum,
    brushedSilver,
    copper,
    gold,
    matteBlackPlastic,
    glossyBlack,
    fanBlade,
    blueAccent,
    ledBlue,
    amberAccent,
    redCable,
    chrome,
    rubber,
    dispose: () => {
      pcbTex.dispose();
      pcbGreenTex.dispose();
      brushedBump.dispose();
      meshTex.dispose();
      materials.forEach((m) => m.dispose());
    },
  };
}
