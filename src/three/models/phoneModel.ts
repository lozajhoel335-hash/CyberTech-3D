import * as THREE from 'three';
import type { MaterialPalette } from '../materials';
import { createBatteryWarningTexture, createScreenDisplayTexture } from '../textures';
import {
  type BuiltHardwareModel,
  type ComponentPartEntry,
  createBeveledPlateGeometry,
  createTubeCable,
  disposeGroupResources,
  registerComponentPart,
} from './helpers';

export function buildPhoneModel(
  mats: MaterialPalette,
  maxAnisotropy: number,
): BuiltHardwareModel {
  const root = new THREE.Group();
  const parts = new Map<string, ComponentPartEntry>();
  const interactables: THREE.Object3D[] = [];

  const screenTex = createScreenDisplayTexture(
    'PC MASTER MOBILE',
    'OLED · TOUCH · CALIBRACIÓN OK',
    '#38BDF8',
    maxAnisotropy,
  );
  const screenMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: screenTex,
    emissive: 0x0c2d4d,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.05,
  });

  const batTex = createBatteryWarningTexture('4500 mAh', '3.87V Li-Ion', maxAnisotropy);
  const batMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: batTex,
    roughness: 0.45,
    metalness: 0.12,
  });

  const clearLayerMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.1,
    metalness: 0.08,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });

  const buildPerimeterFrame = (
    w: number,
    h: number,
    thickness: number,
    depth: number,
    mat: THREE.Material,
  ): THREE.Group => {
    const frame = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, thickness, depth), mat);
    top.position.y = h / 2 - thickness / 2;
    const bot = new THREE.Mesh(new THREE.BoxGeometry(w, thickness, depth), mat);
    bot.position.y = -h / 2 + thickness / 2;
    const left = new THREE.Mesh(new THREE.BoxGeometry(thickness, h - thickness * 2, depth), mat);
    left.position.x = -w / 2 + thickness / 2;
    const right = new THREE.Mesh(new THREE.BoxGeometry(thickness, h - thickness * 2, depth), mat);
    right.position.x = w / 2 - thickness / 2;
    frame.add(top, bot, left, right);
    return frame;
  };

  // Midframe structural spine (subtle chassis core)
  const midFrame = new THREE.Mesh(
    createBeveledPlateGeometry(1.18, 2.38, 0.07, 0.02),
    mats.chassisSteel,
  );
  midFrame.castShadow = true;
  midFrame.receiveShadow = true;
  root.add(midFrame);

  // 1. Vidrio protector exterior (ph_glass)
  const glassGroup = new THREE.Group();
  const frontGlass = new THREE.Mesh(
    createBeveledPlateGeometry(1.1, 2.3, 0.014, 0.006),
    clearLayerMat,
  );
  const glassFrame = buildPerimeterFrame(1.12, 2.32, 0.024, 0.016, mats.brushedSilver);
  glassGroup.add(frontGlass, glassFrame);
  registerComponentPart(parts, interactables, 'ph_glass', glassGroup, [0, 0, 0.085], [0.55, 0.12, 0.95], [0.35, 0.85, 0.02]);
  root.add(glassGroup);

  // 2. Digitalizador táctil (ph_touch)
  const touchGroup = new THREE.Group();
  const touchGrid = new THREE.Mesh(
    new THREE.BoxGeometry(1.04, 2.22, 0.01),
    clearLayerMat,
  );
  const touchFrame = buildPerimeterFrame(1.06, 2.24, 0.02, 0.014, mats.ledBlue);
  touchGroup.add(touchGrid, touchFrame);
  registerComponentPart(parts, interactables, 'ph_touch', touchGroup, [0, 0, 0.068], [-0.52, 0.1, 0.72], [-0.35, 0.65, 0.02]);
  root.add(touchGroup);

  // 3. Pantalla OLED/LCD (ph_screen)
  const screenGroup = new THREE.Group();
  const screenBack = new THREE.Mesh(
    new THREE.BoxGeometry(1.06, 2.24, 0.022),
    mats.copper,
  );
  const screenFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.02, 2.18),
    screenMat,
  );
  screenFace.position.z = 0.013;
  screenGroup.add(screenBack, screenFace);
  registerComponentPart(parts, interactables, 'ph_screen', screenGroup, [0, 0, 0.052], [0, 0, 0.62], [0, 0.15, 0.03]);
  root.add(screenGroup);

  // 4. Batería de litio (ph_battery)
  const batGroup = new THREE.Group();
  const batCell = new THREE.Mesh(
    createBeveledPlateGeometry(0.76, 1.18, 0.06, 0.015),
    batMat,
  );
  const batFlex = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.18, 0.015),
    mats.amberAccent,
  );
  batFlex.position.set(0.28, 0.62, 0.01);
  batGroup.add(batCell, batFlex);
  registerComponentPart(parts, interactables, 'ph_battery', batGroup, [-0.08, -0.08, -0.02], [-0.55, 0, -0.52], [0, 0, -0.05]);
  root.add(batGroup);

  // 5. Placa madre / Logic Board (ph_motherboard)
  const moboGroup = new THREE.Group();
  const moboPcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.95, 0.68, 0.035),
    mats.pcbDarkBlue,
  );
  const socShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.38, 0.34, 0.048),
    mats.brushedSilver,
  );
  socShield.position.set(0.12, -0.05, -0.01);
  const pmicShield = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.24, 0.045),
    mats.chassisSteel,
  );
  pmicShield.position.set(-0.24, -0.1, -0.01);
  moboGroup.add(moboPcb, socShield, pmicShield);
  registerComponentPart(parts, interactables, 'ph_motherboard', moboGroup, [0, 0.72, -0.02], [0, 0.45, -0.35], [0.35, 0.1, -0.04]);
  root.add(moboGroup);

  // 6. Cámaras (ph_cameras)
  const camGroup = new THREE.Group();
  const camModule = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.42, 0.065),
    mats.glossyBlack,
  );
  for (const cy of [-0.1, 0.1]) {
    const lensRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.075, 16),
      mats.brushedSilver,
    );
    lensRing.rotation.x = Math.PI / 2;
    lensRing.position.set(0, cy, -0.01);
    const lensGlass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.08, 16),
      mats.blueAccent,
    );
    lensGlass.rotation.x = Math.PI / 2;
    lensGlass.position.set(0, cy, -0.012);
    camGroup.add(lensRing, lensGlass);
  }
  camGroup.add(camModule);
  registerComponentPart(parts, interactables, 'ph_cameras', camGroup, [-0.28, 0.85, -0.04], [-0.65, 0.65, -0.68], [0, 0.2, -0.06]);
  root.add(camGroup);

  // 7. Altavoz (ph_speaker)
  const spkGroup = new THREE.Group();
  const spkBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.22, 0.045),
    mats.matteBlackPlastic,
  );
  const spkGrill = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.08, 0.05),
    mats.chassisSteel,
  );
  spkGroup.add(spkBox, spkGrill);
  registerComponentPart(parts, interactables, 'ph_speaker', spkGroup, [0.25, -0.96, -0.02], [0.55, -0.45, -0.42], [0.1, -0.1, -0.04]);
  root.add(spkGroup);

  // 8. Micrófono (ph_mic)
  const micGroup = new THREE.Group();
  const micChip = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.09, 0.03),
    mats.gold,
  );
  const micSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.035, 10),
    mats.rubber,
  );
  micSeal.rotation.x = Math.PI / 2;
  micGroup.add(micChip, micSeal);
  registerComponentPart(parts, interactables, 'ph_mic', micGroup, [-0.22, -1.06, -0.02], [-0.45, -0.6, -0.45], [0, -0.08, -0.03]);
  root.add(micGroup);

  // 9. Puerto de carga USB-C (ph_charging_port)
  const portGroup = new THREE.Group();
  const subBoard = new THREE.Mesh(
    new THREE.BoxGeometry(0.75, 0.22, 0.025),
    mats.pcbGreen,
  );
  const usbC = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.14, 0.055),
    mats.brushedSilver,
  );
  usbC.position.y = -0.08;
  portGroup.add(subBoard, usbC);
  registerComponentPart(parts, interactables, 'ph_charging_port', portGroup, [0, -0.98, -0.02], [0, -0.75, -0.35], [0, -0.14, 0]);
  root.add(portGroup);

  // 10. Flex de conexión (ph_flex)
  const flexGroup = new THREE.Group();
  const mainFlex = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 1.48, 0.012),
    mats.amberAccent,
  );
  const fpcTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.08, 0.024),
    mats.glossyBlack,
  );
  fpcTop.position.y = 0.72;
  const fpcBot = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.08, 0.024),
    mats.glossyBlack,
  );
  fpcBot.position.y = -0.72;
  flexGroup.add(mainFlex, fpcTop, fpcBot);
  registerComponentPart(parts, interactables, 'ph_flex', flexGroup, [0.38, -0.1, -0.03], [0.68, 0, -0.35], [0.08, 0, -0.03]);
  root.add(flexGroup);

  // 11. Botones laterales (ph_buttons)
  const btnGroup = new THREE.Group();
  const volBtn = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.34, 0.04),
    mats.brushedSilver,
  );
  volBtn.position.y = 0.28;
  const pwrBtn = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.18, 0.04),
    mats.blueAccent,
  );
  pwrBtn.position.y = -0.08;
  btnGroup.add(volBtn, pwrBtn);
  registerComponentPart(parts, interactables, 'ph_buttons', btnGroup, [0.6, 0.28, 0], [0.75, 0.2, 0], [0.05, 0.15, 0]);
  root.add(btnGroup);

  // 12. Antenas (ph_antennas)
  const antGroup = new THREE.Group();
  const coax = createTubeCable(
    [
      [-0.44, 0.65, -0.02],
      [-0.48, 0, -0.02],
      [-0.44, -0.92, -0.02],
    ],
    0.014,
    mats.ledBlue,
    18,
  );
  const nfcCoil = new THREE.Mesh(
    new THREE.TorusGeometry(0.24, 0.016, 8, 28),
    mats.copper,
  );
  nfcCoil.position.set(0, 0.15, -0.05);
  antGroup.add(coax, nfcCoil);
  registerComponentPart(parts, interactables, 'ph_antennas', antGroup, [0, 0, 0], [-0.45, 0.15, -0.65], [-0.45, 0.3, -0.05]);
  root.add(antGroup);

  // 13. Motor vibrador (ph_vibrator)
  const vibGroup = new THREE.Group();
  const vibBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, 0.16, 0.045),
    mats.aluminum,
  );
  const vibAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.05),
    mats.blueAccent,
  );
  vibGroup.add(vibBody, vibAccent);
  registerComponentPart(parts, interactables, 'ph_vibrator', vibGroup, [-0.32, -0.82, -0.02], [-0.65, -0.4, -0.45], [-0.1, -0.05, -0.04]);
  root.add(vibGroup);

  // 14. Carcasa posterior (ph_back_cover)
  const backGroup = new THREE.Group();
  const backShell = new THREE.Mesh(
    createBeveledPlateGeometry(1.16, 2.36, 0.028, 0.012),
    mats.chassisDark,
  );
  const camIsland = new THREE.Mesh(
    createBeveledPlateGeometry(0.46, 0.52, 0.038, 0.01),
    mats.glossyBlack,
  );
  camIsland.position.set(-0.28, 0.84, -0.015);
  backGroup.add(backShell, camIsland);
  registerComponentPart(parts, interactables, 'ph_back_cover', backGroup, [0, 0, -0.065], [0, 0, -1.25], [0.35, -0.75, -0.04]);
  root.add(backGroup);

  return {
    root,
    parts,
    interactables,
    dispose: () => {
      screenTex.dispose();
      screenMat.dispose();
      batTex.dispose();
      batMat.dispose();
      clearLayerMat.dispose();
      disposeGroupResources(root);
    },
  };
}
