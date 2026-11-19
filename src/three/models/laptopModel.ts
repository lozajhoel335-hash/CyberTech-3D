import * as THREE from 'three';
import type { MaterialPalette } from '../materials';
import { createBatteryWarningTexture, createScreenDisplayTexture } from '../textures';
import {
  type BuiltHardwareModel,
  type ComponentPartEntry,
  createBeveledPlateGeometry,
  createFanAssembly,
  createHeatsinkFins,
  createTubeCable,
  disposeGroupResources,
  registerComponentPart,
} from './helpers';

export function buildLaptopModel(
  mats: MaterialPalette,
  maxAnisotropy: number,
): BuiltHardwareModel {
  const root = new THREE.Group();
  const parts = new Map<string, ComponentPartEntry>();
  const interactables: THREE.Object3D[] = [];
  const fanRotors: THREE.Group[] = [];

  const screenTex = createScreenDisplayTexture(
    'PC MASTER 3D',
    'DIAGNÓSTICO PORTÁTIL · SISTEMA ACTIVO',
    '#38BDF8',
    maxAnisotropy,
  );
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: screenTex,
    emissive: 0x0b2a4a,
    emissiveIntensity: 0.45,
    roughness: 0.14,
    metalness: 0.05,
  });

  const batTex = createBatteryWarningTexture('BATERÍA LI-PO', '11.4V · 52Wh', maxAnisotropy);
  const batMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: batTex,
    roughness: 0.5,
    metalness: 0.15,
  });

  // Base bottom shell (structural anchor)
  const baseShell = new THREE.Mesh(
    createBeveledPlateGeometry(2.8, 1.95, 0.12, 0.025),
    mats.chassisDark,
  );
  baseShell.rotation.x = Math.PI / 2;
  baseShell.position.set(0, -0.06, 0);
  baseShell.receiveShadow = true;
  baseShell.castShadow = true;
  root.add(baseShell);

  // Lid pivot group (hinged at rear z = -0.94, y = 0.04)
  const lidGroup = new THREE.Group();
  lidGroup.position.set(0, 0.04, -0.94);
  // Open to 105 degrees by default or animated via HardwareStage
  lidGroup.rotation.x = -0.35;

  const lidBack = new THREE.Mesh(
    createBeveledPlateGeometry(2.8, 1.92, 0.055, 0.02),
    mats.chassisSteel,
  );
  lidBack.position.set(0, 0.96, -0.02);
  lidGroup.add(lidBack);
  root.add(lidGroup);

  // 1. Pantalla LCD/LED (lap_display) inside lidGroup
  const displayGroup = new THREE.Group();
  const displayBezel = new THREE.Mesh(
    new THREE.BoxGeometry(2.72, 1.84, 0.025),
    mats.glossyBlack,
  );
  const displayPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(2.54, 1.58),
    screenMat,
  );
  displayPanel.position.z = 0.016;
  displayGroup.add(displayBezel, displayPanel);
  registerComponentPart(parts, interactables, 'lap_display', displayGroup, [0, 0.96, 0.02], [0, 0.35, 0.55], [0, 0.25, 0.04]);
  lidGroup.add(displayGroup);

  // 2. Bisagras (lap_hinges)
  const hingesGroup = new THREE.Group();
  for (const sx of [-0.95, 0.95]) {
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.32, 14),
      mats.brushedSilver,
    );
    barrel.rotation.z = Math.PI / 2;
    barrel.position.set(sx, 0, 0);
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.04, 0.25),
      mats.chassisSteel,
    );
    arm.position.set(sx, -0.02, 0.14);
    hingesGroup.add(barrel, arm);
  }
  registerComponentPart(parts, interactables, 'lap_hinges', hingesGroup, [0, 0.04, -0.92], [0, 0.55, -0.45], [0.95, 0.1, 0]);
  root.add(hingesGroup);

  // 3. Teclado integrado (lap_keyboard)
  const kbGroup = new THREE.Group();
  const palmDeck = new THREE.Mesh(
    new THREE.BoxGeometry(2.74, 0.03, 1.88),
    mats.chassisSteel,
  );
  palmDeck.position.y = -0.015;
  const kbWell = new THREE.Mesh(
    new THREE.BoxGeometry(2.38, 0.02, 0.86),
    mats.matteBlackPlastic,
  );
  kbWell.position.set(0, 0.005, -0.22);
  kbGroup.add(palmDeck, kbWell);
  // Keycaps grid (InstancedMesh for crisp performance)
  const keyGeo = new THREE.BoxGeometry(0.115, 0.018, 0.11);
  const keyMesh = new THREE.InstancedMesh(keyGeo, mats.glossyBlack, 60);
  const dummy = new THREE.Object3D();
  let kIdx = 0;
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 12; col++) {
      dummy.position.set(-1.05 + col * 0.19, 0.02, -0.54 + row * 0.16);
      dummy.updateMatrix();
      keyMesh.setMatrixAt(kIdx++, dummy.matrix);
    }
  }
  keyMesh.computeBoundingSphere();
  kbGroup.add(keyMesh);
  registerComponentPart(parts, interactables, 'lap_keyboard', kbGroup, [0, 0.035, 0], [0, 1.1, 0], [0, 0.1, -0.2]);
  root.add(kbGroup);

  // 4. Touchpad (lap_touchpad)
  const tpGroup = new THREE.Group();
  const tpPad = new THREE.Mesh(
    createBeveledPlateGeometry(0.84, 0.52, 0.025, 0.008),
    mats.chassisDark,
  );
  tpPad.rotation.x = Math.PI / 2;
  const tpRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.01, 0.54),
    mats.blueAccent,
  );
  tpRim.position.y = -0.008;
  tpGroup.add(tpPad, tpRim);
  registerComponentPart(parts, interactables, 'lap_touchpad', tpGroup, [0, 0.055, 0.58], [0, 1.35, 0.25], [0, 0.1, 0]);
  root.add(tpGroup);

  // 5. Batería interna (lap_battery)
  const batGroup = new THREE.Group();
  const batPack = new THREE.Mesh(
    new THREE.BoxGeometry(1.95, 0.06, 0.62),
    batMat,
  );
  const batCellLines = new THREE.Mesh(
    new THREE.BoxGeometry(1.88, 0.065, 0.02),
    mats.matteBlackPlastic,
  );
  batGroup.add(batPack, batCellLines);
  registerComponentPart(parts, interactables, 'lap_battery', batGroup, [0, -0.01, 0.52], [0, 0.48, 0.55], [0, 0.12, 0]);
  root.add(batGroup);

  // 6. Placa madre de laptop (lap_motherboard)
  const moboGroup = new THREE.Group();
  const moboPcb = new THREE.Mesh(
    new THREE.BoxGeometry(2.15, 0.028, 0.92),
    mats.pcbDarkBlue,
  );
  moboGroup.add(moboPcb);
  registerComponentPart(parts, interactables, 'lap_motherboard', moboGroup, [0, -0.02, -0.32], [0, 0.15, -0.1], [-0.8, 0.1, 0]);
  root.add(moboGroup);

  // 7. Procesador móvil (lap_cpu)
  const cpuGroup = new THREE.Group();
  const cpuSubstrate = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.02, 0.28),
    mats.pcbGreen,
  );
  const cpuDie = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.025, 0.14),
    mats.chrome,
  );
  cpuDie.position.y = 0.015;
  cpuGroup.add(cpuSubstrate, cpuDie);
  registerComponentPart(parts, interactables, 'lap_cpu', cpuGroup, [-0.12, 0.005, -0.35], [0, 0.45, 0], [0, 0.12, 0]);
  root.add(cpuGroup);

  // 8. Memoria RAM SO-DIMM (lap_ram)
  const ramGroup = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const sodimm = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.02, 0.18),
      mats.pcbGreen,
    );
    sodimm.position.z = i * 0.21;
    const chips = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.026, 0.12),
      mats.glossyBlack,
    );
    chips.position.z = i * 0.21;
    ramGroup.add(sodimm, chips);
  }
  registerComponentPart(parts, interactables, 'lap_ram', ramGroup, [0.55, 0.01, -0.22], [0.45, 0.55, 0.15], [0, 0.12, 0.1]);
  root.add(ramGroup);

  // 9. Unidad SSD M.2 (lap_ssd)
  const ssdGroup = new THREE.Group();
  const ssdStick = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.022, 0.16),
    mats.matteBlackPlastic,
  );
  const ssdSticker = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.026, 0.13),
    mats.blueAccent,
  );
  ssdGroup.add(ssdStick, ssdSticker);
  registerComponentPart(parts, interactables, 'lap_ssd', ssdGroup, [-0.72, 0.01, -0.1], [-0.45, 0.55, 0.2], [0, 0.12, 0]);
  root.add(ssdGroup);

  // 10. Ventilador turbina (lap_fan)
  const fanGroup = new THREE.Group();
  const blower = createFanAssembly(0.42, 0.06, mats, 9, false);
  blower.group.rotation.x = Math.PI / 2;
  fanRotors.push(blower.rotor);
  fanGroup.add(blower.group);
  registerComponentPart(parts, interactables, 'lap_fan', fanGroup, [-0.75, 0.015, -0.58], [-0.55, 0.72, -0.3], [0, 0.14, 0]);
  root.add(fanGroup);

  // 11. Disipador de cobre (lap_heatsink)
  const hsGroup = new THREE.Group();
  const hsFins = createHeatsinkFins(0.46, 0.055, 0.14, 14, mats.copper);
  hsGroup.add(hsFins);
  registerComponentPart(parts, interactables, 'lap_heatsink', hsGroup, [-0.42, 0.015, -0.78], [-0.2, 0.72, -0.55], [0, 0.12, 0]);
  root.add(hsGroup);

  // 12. Sistema de refrigeración Heatpipes (lap_cooling)
  const coolGroup = new THREE.Group();
  const coldPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.025, 0.24),
    mats.copper,
  );
  const pipe1 = createTubeCable(
    [
      [0, 0.01, 0],
      [-0.25, 0.01, -0.15],
      [-0.45, 0.01, -0.4],
    ],
    0.018,
    mats.copper,
    14,
  );
  const pipe2 = createTubeCable(
    [
      [0.05, 0.01, 0.04],
      [-0.2, 0.01, -0.1],
      [-0.36, 0.01, -0.4],
    ],
    0.018,
    mats.copper,
    14,
  );
  coolGroup.add(coldPlate, pipe1, pipe2);
  registerComponentPart(parts, interactables, 'lap_cooling', coolGroup, [-0.12, 0.03, -0.35], [0, 0.85, -0.2], [-0.15, 0.14, -0.18]);
  root.add(coolGroup);

  // 13. Altavoces estéreo (lap_speakers)
  const spkGroup = new THREE.Group();
  for (const sx of [-1.15, 1.15]) {
    const spk = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.05, 0.42),
      mats.matteBlackPlastic,
    );
    spk.position.x = sx;
    const cone = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.055, 14),
      mats.chassisSteel,
    );
    cone.position.set(sx, 0.005, 0);
    spkGroup.add(spk, cone);
  }
  registerComponentPart(parts, interactables, 'lap_speakers', spkGroup, [0, -0.01, 0.62], [0, 0.45, 0.72], [1.15, 0.1, 0]);
  root.add(spkGroup);

  // 14. Puertos USB (lap_usb)
  const usbGroup = new THREE.Group();
  const usbA = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.16), mats.brushedSilver);
  const usbC = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.035, 0.1), mats.blueAccent);
  usbC.position.z = 0.2;
  usbGroup.add(usbA, usbC);
  registerComponentPart(parts, interactables, 'lap_usb', usbGroup, [1.22, -0.01, -0.25], [0.65, 0.25, 0], [0.05, 0.12, 0.1]);
  root.add(usbGroup);

  // 15. Conector de carga (lap_charging)
  const chgGroup = new THREE.Group();
  const dcJack = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.06, 0.14), mats.amberAccent);
  const dcPin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.16, 10),
    mats.gold,
  );
  dcPin.rotation.z = Math.PI / 2;
  chgGroup.add(dcJack, dcPin);
  registerComponentPart(parts, interactables, 'lap_charging', chgGroup, [-1.22, -0.01, -0.52], [-0.65, 0.25, -0.2], [-0.05, 0.12, 0]);
  root.add(chgGroup);

  return {
    root,
    parts,
    interactables,
    animatedExtra: {
      lidGroup,
      fanRotors,
    },
    dispose: () => {
      screenTex.dispose();
      screenMat.dispose();
      batTex.dispose();
      batMat.dispose();
      disposeGroupResources(root);
    },
  };
}
