import * as THREE from 'three';
import type { MaterialPalette } from '../materials';
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

export function buildDesktopPCModel(mats: MaterialPalette): BuiltHardwareModel {
  const root = new THREE.Group();
  const parts = new Map<string, ComponentPartEntry>();
  const interactables: THREE.Object3D[] = [];
  const fanRotors: THREE.Group[] = [];

  // 1. CHASSIS (Gabinete o chasis + panel de vidrio templado desmontable)
  const chassisGroup = new THREE.Group();
  const cW = 1.25;
  const cH = 2.35;
  const cD = 2.25;

  // Bottom plate & rubber feet
  const bottomPlate = new THREE.Mesh(
    new THREE.BoxGeometry(cW, 0.08, cD),
    mats.chassisDark,
  );
  bottomPlate.position.set(0, -cH / 2 + 0.04, 0);
  chassisGroup.add(bottomPlate);

  const footGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.08, 14);
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const foot = new THREE.Mesh(footGeo, mats.rubber);
      foot.position.set(sx * (cW / 2 - 0.16), -cH / 2 - 0.03, sz * (cD / 2 - 0.18));
      chassisGroup.add(foot);
    }
  }

  // Top plate with magnetic filter inset
  const topPlate = new THREE.Mesh(
    new THREE.BoxGeometry(cW, 0.07, cD),
    mats.chassisDark,
  );
  topPlate.position.set(0, cH / 2 - 0.035, 0);
  const topFilter = new THREE.Mesh(
    new THREE.BoxGeometry(cW * 0.72, 0.015, cD * 0.65),
    mats.chassisMesh,
  );
  topFilter.position.set(0, cH / 2 + 0.004, -0.05);
  chassisGroup.add(topPlate, topFilter);

  // Right steel panel (backside of motherboard tray)
  const rightPanel = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, cH - 0.08, cD),
    mats.chassisSteel,
  );
  rightPanel.position.set(-cW / 2 + 0.025, 0, 0);
  chassisGroup.add(rightPanel);

  // Internal motherboard tray
  const moboTray = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, cH - 0.55, cD - 0.18),
    mats.chassisDark,
  );
  moboTray.position.set(-0.34, 0.2, 0);
  chassisGroup.add(moboTray);

  // PSU shroud
  const shroudTop = new THREE.Mesh(
    new THREE.BoxGeometry(cW - 0.14, 0.04, cD - 0.14),
    mats.chassisSteel,
  );
  shroudTop.position.set(0.02, -0.58, 0);
  const shroudSide = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.56, cD - 0.14),
    mats.chassisDark,
  );
  shroudSide.position.set(0.58, -0.86, 0);
  chassisGroup.add(shroudTop, shroudSide);

  // Rear frame with I/O cutout
  const rearTop = new THREE.Mesh(
    new THREE.BoxGeometry(cW, cH - 0.08, 0.05),
    mats.chassisDark,
  );
  rearTop.position.set(0, 0, -cD / 2 + 0.025);
  chassisGroup.add(rearTop);

  // Left Tempered Glass Side Door (hinged/exploded outward on +X)
  const doorGroup = new THREE.Group();
  const glassPane = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, cH - 0.2, cD - 0.14),
    mats.temperedGlass,
  );
  const glassFrameTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.07, cD - 0.1),
    mats.glossyBlack,
  );
  glassFrameTop.position.y = (cH - 0.2) / 2;
  const glassFrameBot = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.07, cD - 0.1),
    mats.glossyBlack,
  );
  glassFrameBot.position.y = -(cH - 0.2) / 2;
  const thumbScrewGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12);
  thumbScrewGeo.rotateZ(Math.PI / 2);
  for (const sy of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const screw = new THREE.Mesh(thumbScrewGeo, mats.brushedSilver);
      screw.position.set(0.02, sy * (cH / 2 - 0.22), sz * (cD / 2 - 0.22));
      doorGroup.add(screw);
    }
  }
  doorGroup.add(glassPane, glassFrameTop, glassFrameBot);
  doorGroup.position.set(cW / 2 - 0.015, 0, 0);
  chassisGroup.add(doorGroup);

  registerComponentPart(parts, interactables, 'chassis', chassisGroup, [0, 0, 0], [-0.45, 0, 0], [-0.4, 1.0, -0.6]);
  root.add(chassisGroup);

  // 2. FRONT PANEL (Panel frontal)
  const frontPanelGroup = new THREE.Group();
  const frontBezel = new THREE.Mesh(
    createBeveledPlateGeometry(cW, cH - 0.04, 0.12, 0.025),
    mats.chassisDark,
  );
  const frontMesh = new THREE.Mesh(
    new THREE.BoxGeometry(cW * 0.78, cH * 0.72, 0.04),
    mats.chassisMesh,
  );
  frontMesh.position.set(0, -0.1, 0.048);
  const frontAccentStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, cH * 0.76, 0.03),
    mats.ledBlue,
  );
  frontAccentStrip.position.set(cW * 0.43, -0.05, 0.052);
  // Power button & front I/O cluster
  const pwrBtn = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.04, 16),
    mats.blueAccent,
  );
  pwrBtn.rotation.x = Math.PI / 2;
  pwrBtn.position.set(-0.28, cH * 0.42, 0.055);
  frontPanelGroup.add(frontBezel, frontMesh, frontAccentStrip, pwrBtn);
  registerComponentPart(parts, interactables, 'front_panel', frontPanelGroup, [0, 0, cD / 2 + 0.04], [0, 0, 1.0], [0, 0.85, 0.15]);
  root.add(frontPanelGroup);

  // 3. MOTHERBOARD (Placa madre)
  const moboGroup = new THREE.Group();
  const moboPlate = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 1.48, 1.24),
    mats.pcbDarkBlue,
  );
  moboGroup.add(moboPlate);
  // VRM heatsinks & I/O shroud on PC motherboard
  const moboVrmTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.15, 0.42),
    mats.aluminum,
  );
  moboVrmTop.position.set(0.07, 0.56, -0.15);
  const moboVrmSide = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.46, 0.14),
    mats.chassisSteel,
  );
  moboVrmSide.position.set(0.07, 0.34, -0.45);
  const moboChipset = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.28, 0.28),
    mats.chassisSteel,
  );
  moboChipset.position.set(0.055, -0.34, 0.32);
  // M.2 shield
  const m2Shield = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.09, 0.36),
    mats.brushedSilver,
  );
  m2Shield.position.set(0.04, -0.02, -0.08);
  moboGroup.add(moboVrmTop, moboVrmSide, moboChipset, m2Shield);
  registerComponentPart(parts, interactables, 'motherboard', moboGroup, [-0.28, 0.25, -0.12], [-0.25, 0.1, -0.2], [0.06, 0.58, 0.35]);
  root.add(moboGroup);

  // 4. CPU (Procesador CPU)
  const cpuGroup = new THREE.Group();
  const cpuSubstrate = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.24, 0.24),
    mats.pcbGreen,
  );
  const cpuIhs = new THREE.Mesh(
    createBeveledPlateGeometry(0.2, 0.2, 0.03, 0.01),
    mats.brushedSilver,
  );
  cpuIhs.rotation.y = Math.PI / 2;
  cpuIhs.position.x = 0.02;
  const cpuCornerMark = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.035, 0.035),
    mats.gold,
  );
  cpuCornerMark.position.set(0.022, -0.09, -0.09);
  cpuGroup.add(cpuSubstrate, cpuIhs, cpuCornerMark);
  registerComponentPart(parts, interactables, 'cpu', cpuGroup, [-0.23, 0.52, -0.25], [0.45, 0.25, 0], [0.04, 0.14, 0]);
  root.add(cpuGroup);

  // 5. CPU COOLER (Disipador del procesador)
  const coolerGroup = new THREE.Group();
  const copperBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.2, 0.2),
    mats.copper,
  );
  copperBase.position.x = -0.12;
  const towerFins = createHeatsinkFins(0.32, 0.42, 0.38, 12, mats.aluminum);
  towerFins.position.x = 0.12;
  // 4 Copper heatpipes
  for (const offsetZ of [-0.1, -0.035, 0.035, 0.1]) {
    const pipe = createTubeCable(
      [
        [0.24, 0.18, offsetZ],
        [-0.12, 0.06, offsetZ * 0.6],
        [-0.12, -0.06, offsetZ * 0.6],
        [0.24, -0.18, offsetZ],
      ],
      0.016,
      mats.copper,
      16,
    );
    coolerGroup.add(pipe);
  }
  const coolerFan = createFanAssembly(0.38, 0.08, mats, 7, true);
  coolerFan.group.rotation.y = Math.PI / 2;
  coolerFan.group.position.set(0.12, 0, 0.24);
  fanRotors.push(coolerFan.rotor);
  coolerGroup.add(copperBase, towerFins, coolerFan.group);
  registerComponentPart(parts, interactables, 'cpu_cooler', coolerGroup, [-0.04, 0.52, -0.25], [0.98, 0.28, 0.08], [0.15, 0.28, 0]);
  root.add(coolerGroup);

  // 6. RAM (Memoria RAM - 2 sticks)
  const ramGroup = new THREE.Group();
  for (let i = 0; i < 2; i++) {
    const stick = new THREE.Group();
    const ramPcb = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.48, 0.11),
      mats.pcbDarkBlue,
    );
    const ramSink = new THREE.Mesh(
      new THREE.BoxGeometry(0.032, 0.49, 0.1),
      mats.chassisSteel,
    );
    ramSink.position.x = 0.008;
    const ramTopBar = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.49, 0.025),
      mats.ledBlue,
    );
    ramTopBar.position.set(0.01, 0, 0.055);
    const goldPins = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.46, 0.018),
      mats.gold,
    );
    goldPins.position.z = -0.055;
    stick.add(ramPcb, ramSink, ramTopBar, goldPins);
    stick.position.z = i * 0.065;
    ramGroup.add(stick);
  }
  registerComponentPart(parts, interactables, 'ram', ramGroup, [-0.18, 0.52, 0.16], [0.85, 0.25, 0.45], [0.05, 0.28, 0.03]);
  root.add(ramGroup);

  // 7. GPU (Tarjeta gráfica GPU)
  const gpuGroup = new THREE.Group();
  const gpuShroud = new THREE.Mesh(
    createBeveledPlateGeometry(0.95, 0.42, 0.16, 0.02),
    mats.chassisSteel,
  );
  gpuShroud.rotation.x = Math.PI / 2;
  gpuShroud.rotation.z = Math.PI / 2;
  const gpuBackplate = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.02, 0.96),
    mats.chassisDark,
  );
  gpuBackplate.position.y = 0.095;
  const gpuHeatsink = createHeatsinkFins(0.36, 0.08, 0.86, 16, mats.aluminum);
  gpuHeatsink.position.y = 0.02;
  const gpuStripe = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.03, 0.65),
    mats.ledBlue,
  );
  gpuStripe.position.set(0.21, 0.05, 0);
  // Dual bottom fans
  for (const fz of [-0.24, 0.24]) {
    const gFan = createFanAssembly(0.34, 0.035, mats, 7, false);
    gFan.group.rotation.x = Math.PI / 2;
    gFan.group.position.set(0, -0.075, fz);
    fanRotors.push(gFan.rotor);
    gpuGroup.add(gFan.group);
  }
  // PCIe bracket & connector
  const gpuBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.16, 0.03),
    mats.brushedSilver,
  );
  gpuBracket.position.set(0, 0.01, -0.49);
  gpuGroup.add(gpuShroud, gpuBackplate, gpuHeatsink, gpuStripe, gpuBracket);
  registerComponentPart(parts, interactables, 'gpu', gpuGroup, [0.02, -0.02, -0.15], [1.12, -0.05, 0.2], [0.22, 0.12, 0]);
  root.add(gpuGroup);

  // 8. EXPANSION CARDS (Tarjetas de expansión Wi-Fi / Red PCIe x1)
  const expGroup = new THREE.Group();
  const expPcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.28, 0.02, 0.42),
    mats.pcbGreen,
  );
  const expSink = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.035, 0.22),
    mats.blueAccent,
  );
  expSink.position.y = -0.018;
  const expBracket = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.12, 0.025),
    mats.brushedSilver,
  );
  expBracket.position.set(0, 0, -0.22);
  // Dual antennas sticking out rear
  for (const ax of [-0.06, 0.06]) {
    const ant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.02, 0.34, 10),
      mats.matteBlackPlastic,
    );
    ant.position.set(ax, 0.15, -0.25);
    expGroup.add(ant);
  }
  expGroup.add(expPcb, expSink, expBracket);
  registerComponentPart(parts, interactables, 'expansion_cards', expGroup, [-0.1, -0.3, -0.3], [1.05, -0.25, -0.35], [0.15, 0.05, 0]);
  root.add(expGroup);

  // 9. PSU (Fuente de alimentación)
  const psuGroup = new THREE.Group();
  const psuBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.68, 0.42, 0.72),
    mats.chassisDark,
  );
  const psuLabel = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.24, 0.48),
    mats.amberAccent,
  );
  psuLabel.position.x = 0.345;
  const psuFanGrille = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.25, 0.03, 20),
    mats.chassisMesh,
  );
  psuFanGrille.position.y = 0.215;
  const psuSwitch = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.06, 0.03),
    mats.redCable,
  );
  psuSwitch.position.set(-0.18, -0.05, -0.365);
  const psuAcSocket = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.1, 0.03),
    mats.matteBlackPlastic,
  );
  psuAcSocket.position.set(0.12, -0.05, -0.365);
  psuGroup.add(psuBody, psuLabel, psuFanGrille, psuSwitch, psuAcSocket);
  registerComponentPart(parts, interactables, 'psu', psuGroup, [0, -0.88, -0.62], [0.95, -0.45, -0.65], [0.35, 0.1, 0]);
  root.add(psuGroup);

  // 10. HDD (Disco duro HDD 3.5")
  const hddGroup = new THREE.Group();
  const hddBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.45, 0.13, 0.62),
    mats.chassisSteel,
  );
  const hddTopCover = new THREE.Mesh(
    new THREE.BoxGeometry(0.41, 0.02, 0.56),
    mats.brushedSilver,
  );
  hddTopCover.position.y = 0.072;
  const hddDiscHub = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.028, 20),
    mats.chrome,
  );
  hddDiscHub.position.set(0, 0.078, 0.05);
  hddGroup.add(hddBody, hddTopCover, hddDiscHub);
  registerComponentPart(parts, interactables, 'hdd', hddGroup, [0, -0.92, 0.42], [0.85, -0.5, 0.65], [0.22, 0.12, 0]);
  root.add(hddGroup);

  // 11. SSD (Unidad SSD 2.5")
  const ssdGroup = new THREE.Group();
  const ssdBody = new THREE.Mesh(
    createBeveledPlateGeometry(0.32, 0.05, 0.44, 0.01),
    mats.matteBlackPlastic,
  );
  const ssdBadge = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.056, 0.24),
    mats.blueAccent,
  );
  ssdGroup.add(ssdBody, ssdBadge);
  ssdGroup.rotation.z = Math.PI / 2;
  registerComponentPart(parts, interactables, 'ssd', ssdGroup, [-0.26, -0.35, 0.58], [0.7, -0.1, 0.75], [0.08, 0.15, 0]);
  root.add(ssdGroup);

  // 12. CASE FANS (Ventiladores frontales y trasero)
  const fansGroup = new THREE.Group();
  for (const fy of [-0.35, 0.35]) {
    const fFan = createFanAssembly(0.55, 0.1, mats, 7, true);
    fFan.group.position.set(0, fy, 0.96);
    fanRotors.push(fFan.rotor);
    fansGroup.add(fFan.group);
  }
  const rFan = createFanAssembly(0.52, 0.1, mats, 7, true);
  rFan.group.position.set(0.05, 0.56, -1.03);
  fanRotors.push(rFan.rotor);
  fansGroup.add(rFan.group);
  registerComponentPart(parts, interactables, 'case_fans', fansGroup, [0, 0, 0], [0, 0.15, 0.85], [0, 0.45, 0.96]);
  root.add(fansGroup);

  // 13. COOLING SYSTEM (Sistema de refrigeración superior - radiador y ventiladores)
  const coolingGroup = new THREE.Group();
  const radBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.54, 0.12, 1.15),
    mats.chassisDark,
  );
  const radFins = createHeatsinkFins(0.48, 0.09, 1.05, 18, mats.aluminum);
  const topFan1 = createFanAssembly(0.48, 0.09, mats, 7, true);
  topFan1.group.rotation.x = Math.PI / 2;
  topFan1.group.position.set(0, -0.1, -0.28);
  const topFan2 = createFanAssembly(0.48, 0.09, mats, 7, true);
  topFan2.group.rotation.x = Math.PI / 2;
  topFan2.group.position.set(0, -0.1, 0.28);
  fanRotors.push(topFan1.rotor, topFan2.rotor);
  coolingGroup.add(radBody, radFins, topFan1.group, topFan2.group);
  registerComponentPart(parts, interactables, 'cooling_system', coolingGroup, [0.05, 1.04, -0.1], [0, 0.72, 0], [0, 0.18, 0]);
  root.add(coolingGroup);

  // 14. SATA CABLES (Cables SATA rojos)
  const sataGroup = new THREE.Group();
  const sata1 = createTubeCable(
    [
      [-0.22, -0.18, 0.45],
      [-0.1, -0.26, 0.6],
      [-0.24, -0.35, 0.6],
    ],
    0.018,
    mats.redCable,
  );
  const sata2 = createTubeCable(
    [
      [-0.22, -0.26, 0.45],
      [-0.08, -0.62, 0.56],
      [-0.04, -0.88, 0.45],
    ],
    0.018,
    mats.redCable,
  );
  sataGroup.add(sata1, sata2);
  registerComponentPart(parts, interactables, 'sata_cables', sataGroup, [0, 0, 0], [0.6, -0.25, 0.5], [-0.15, -0.45, 0.55]);
  root.add(sataGroup);

  // 15. POWER CONNECTORS (Conectores de alimentación ATX 24p y GPU PCIe)
  const powerGroup = new THREE.Group();
  const atx24Cable = createTubeCable(
    [
      [-0.15, -0.78, -0.42],
      [-0.36, -0.3, 0.35],
      [-0.22, 0.32, 0.42],
    ],
    0.032,
    mats.matteBlackPlastic,
  );
  const atxHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.28, 0.08),
    mats.amberAccent,
  );
  atxHead.position.set(-0.22, 0.32, 0.42);
  const pcieCable = createTubeCable(
    [
      [0.05, -0.78, -0.38],
      [0.25, -0.42, 0.05],
      [0.16, -0.02, 0.14],
    ],
    0.026,
    mats.matteBlackPlastic,
  );
  const pcieHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.07, 0.1),
    mats.amberAccent,
  );
  pcieHead.position.set(0.16, -0.02, 0.14);
  powerGroup.add(atx24Cable, atxHead, pcieCable, pcieHead);
  registerComponentPart(parts, interactables, 'power_connectors', powerGroup, [0, 0, 0], [0.75, 0.05, 0.35], [-0.15, 0.22, 0.42]);
  root.add(powerGroup);

  // 16. CMOS BATTERY (Batería CMOS CR2032)
  const cmosGroup = new THREE.Group();
  const cmosHolder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.095, 0.095, 0.028, 20),
    mats.matteBlackPlastic,
  );
  cmosHolder.rotation.z = Math.PI / 2;
  const cmosCell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.032, 20),
    mats.chrome,
  );
  cmosCell.rotation.z = Math.PI / 2;
  cmosCell.position.x = 0.006;
  cmosGroup.add(cmosHolder, cmosCell);
  registerComponentPart(parts, interactables, 'cmos_battery', cmosGroup, [-0.24, -0.22, -0.18], [0.55, -0.22, 0.25], [0.05, 0.1, 0]);
  root.add(cmosGroup);

  // 17. USB PORTS (Puertos USB frontales y traseros)
  const usbGroup = new THREE.Group();
  const usbBlock = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.28, 0.12),
    mats.brushedSilver,
  );
  const usbInsert1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.06, 0.13),
    mats.blueAccent,
  );
  usbInsert1.position.set(0.03, 0.06, 0);
  const usbInsert2 = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, 0.06, 0.13),
    mats.blueAccent,
  );
  usbInsert2.position.set(0.03, -0.06, 0);
  usbGroup.add(usbBlock, usbInsert1, usbInsert2);
  registerComponentPart(parts, interactables, 'usb_ports', usbGroup, [-0.24, 0.56, -0.68], [-0.3, 0.35, -0.85], [0, 0.2, 0]);
  root.add(usbGroup);

  // 18. HDMI PORTS (Puertos HDMI en GPU y placa)
  const hdmiGroup = new THREE.Group();
  const hdmiHousing = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.08, 0.12),
    mats.gold,
  );
  const hdmiInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.09, 0.035, 0.13),
    mats.glossyBlack,
  );
  hdmiGroup.add(hdmiHousing, hdmiInner);
  registerComponentPart(parts, interactables, 'hdmi_ports', hdmiGroup, [0.05, -0.02, -0.68], [0.7, -0.05, -0.75], [0, 0.12, 0]);
  root.add(hdmiGroup);

  return {
    root,
    parts,
    interactables,
    animatedExtra: {
      doorGroup,
      fanRotors,
    },
    dispose: () => disposeGroupResources(root),
  };
}
