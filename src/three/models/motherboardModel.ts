import * as THREE from 'three';
import type { MaterialPalette } from '../materials';
import {
  type BuiltHardwareModel,
  type ComponentPartEntry,
  createBeveledPlateGeometry,
  createHeatsinkFins,
  disposeGroupResources,
  registerComponentPart,
} from './helpers';

export function buildMotherboardModel(mats: MaterialPalette): BuiltHardwareModel {
  const root = new THREE.Group();
  const parts = new Map<string, ComponentPartEntry>();
  const interactables: THREE.Object3D[] = [];

  // Base ATX PCB substrate (not exploded, anchor board)
  const pcbBase = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.06, 3.1),
    mats.pcbDarkBlue,
  );
  pcbBase.receiveShadow = true;
  pcbBase.castShadow = true;
  root.add(pcbBase);

  // Corner brass standoffs / mounting holes
  const holeGeo = new THREE.CylinderGeometry(0.055, 0.055, 0.07, 12);
  for (const hx of [-1.18, 0, 1.18]) {
    for (const hz of [-1.42, 0, 1.42]) {
      const hole = new THREE.Mesh(holeGeo, mats.gold);
      hole.position.set(hx, 0, hz);
      root.add(hole);
    }
  }

  // 1. Socket del procesador (mb_socket)
  const socketGroup = new THREE.Group();
  const socketBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.56, 0.04, 0.56),
    mats.matteBlackPlastic,
  );
  const socketPinPad = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.045, 0.42),
    mats.gold,
  );
  const ilmFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.58, 0.025, 0.58),
    mats.brushedSilver,
  );
  ilmFrame.position.y = 0.032;
  const retentionArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.012, 0.62, 8),
    mats.chrome,
  );
  retentionArm.rotation.x = Math.PI / 2;
  retentionArm.position.set(0.32, 0.04, 0);
  socketGroup.add(socketBase, socketPinPad, ilmFrame, retentionArm);
  registerComponentPart(parts, interactables, 'mb_socket', socketGroup, [-0.15, 0.05, -0.62], [0, 0.35, 0], [0, 0.14, 0]);
  root.add(socketGroup);

  // 2. Procesador CPU (mb_cpu)
  const cpuGroup = new THREE.Group();
  const cpuPcb = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.025, 0.42),
    mats.pcbGreen,
  );
  const cpuIhs = new THREE.Mesh(
    createBeveledPlateGeometry(0.34, 0.34, 0.035, 0.012),
    mats.brushedSilver,
  );
  cpuIhs.rotation.x = Math.PI / 2;
  cpuIhs.position.y = 0.025;
  const cpuTriangle = new THREE.Mesh(
    new THREE.BoxGeometry(0.05, 0.01, 0.05),
    mats.gold,
  );
  cpuTriangle.position.set(-0.17, 0.018, 0.17);
  cpuGroup.add(cpuPcb, cpuIhs, cpuTriangle);
  registerComponentPart(parts, interactables, 'mb_cpu', cpuGroup, [-0.15, 0.11, -0.62], [0, 1.05, 0], [0, 0.15, 0]);
  root.add(cpuGroup);

  // 3. Ranuras DIMM de memoria RAM (mb_dimm)
  const dimmGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const slot = new THREE.Mesh(
      new THREE.BoxGeometry(0.065, 0.09, 1.15),
      i % 2 === 1 ? mats.blueAccent : mats.matteBlackPlastic,
    );
    slot.position.x = i * 0.11;
    const latchTop = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.11, 0.07),
      mats.chassisSteel,
    );
    latchTop.position.set(i * 0.11, 0.01, -0.6);
    const latchBot = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.11, 0.07),
      mats.chassisSteel,
    );
    latchBot.position.set(i * 0.11, 0.01, 0.6);
    dimmGroup.add(slot, latchTop, latchBot);
  }
  registerComponentPart(parts, interactables, 'mb_dimm', dimmGroup, [0.55, 0.075, -0.62], [0.45, 0.55, 0], [0.16, 0.16, 0]);
  root.add(dimmGroup);

  // 4. Chipset PCH (mb_chipset)
  const chipsetGroup = new THREE.Group();
  const pchDie = new THREE.Mesh(
    new THREE.BoxGeometry(0.32, 0.03, 0.32),
    mats.glossyBlack,
  );
  const pchSink = new THREE.Mesh(
    createBeveledPlateGeometry(0.56, 0.56, 0.09, 0.02),
    mats.chassisSteel,
  );
  pchSink.rotation.x = Math.PI / 2;
  pchSink.position.y = 0.06;
  const pchAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.02, 0.08),
    mats.ledBlue,
  );
  pchAccent.position.set(0, 0.11, 0.12);
  chipsetGroup.add(pchDie, pchSink, pchAccent);
  registerComponentPart(parts, interactables, 'mb_chipset', chipsetGroup, [0.68, 0.05, 0.72], [0.35, 0.65, 0.35], [0, 0.18, 0]);
  root.add(chipsetGroup);

  // 5. BIOS / UEFI Chip (mb_bios)
  const biosGroup = new THREE.Group();
  const biosIc = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.035, 0.12),
    mats.glossyBlack,
  );
  const biosDot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.04, 10),
    mats.ledBlue,
  );
  biosDot.position.set(-0.04, 0.005, -0.03);
  for (let p = -1.5; p <= 1.5; p += 1) {
    const pinL = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.016), mats.chrome);
    pinL.position.set(-0.08, -0.005, p * 0.028);
    const pinR = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.015, 0.016), mats.chrome);
    pinR.position.set(0.08, -0.005, p * 0.028);
    biosGroup.add(pinL, pinR);
  }
  biosGroup.add(biosIc, biosDot);
  registerComponentPart(parts, interactables, 'mb_bios', biosGroup, [0.24, 0.05, 0.92], [0, 0.55, 0.2], [0, 0.12, 0]);
  root.add(biosGroup);

  // 6. Batería CMOS (mb_cmos)
  const cmosGroup = new THREE.Group();
  const cmosSocket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.035, 24),
    mats.matteBlackPlastic,
  );
  const cmosCell = new THREE.Mesh(
    new THREE.CylinderGeometry(0.135, 0.135, 0.045, 24),
    mats.chrome,
  );
  cmosCell.position.y = 0.01;
  cmosGroup.add(cmosSocket, cmosCell);
  registerComponentPart(parts, interactables, 'mb_cmos', cmosGroup, [-0.15, 0.05, 0.42], [0, 0.85, 0], [0, 0.14, 0]);
  root.add(cmosGroup);

  // 7. Conector ATX 24 pines (mb_atx24)
  const atx24Group = new THREE.Group();
  const atxBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.13, 0.62),
    mats.matteBlackPlastic,
  );
  const atxRim = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.04, 0.58),
    mats.gold,
  );
  atxRim.position.y = 0.06;
  atx24Group.add(atxBody, atxRim);
  registerComponentPart(parts, interactables, 'mb_atx24', atx24Group, [1.14, 0.095, -0.58], [0.65, 0.45, 0], [0, 0.15, 0]);
  root.add(atx24Group);

  // 8. Conector alimentación CPU EPS 8 pines (mb_cpu_power)
  const epsGroup = new THREE.Group();
  const epsBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.13, 0.15),
    mats.amberAccent,
  );
  const epsPins = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.04, 0.11),
    mats.gold,
  );
  epsPins.position.y = 0.06;
  epsGroup.add(epsBody, epsPins);
  registerComponentPart(parts, interactables, 'mb_cpu_power', epsGroup, [-0.82, 0.095, -1.38], [-0.25, 0.55, -0.45], [0, 0.15, 0]);
  root.add(epsGroup);

  // 9. Ranuras PCI Express (mb_pcie)
  const pcieGroup = new THREE.Group();
  const x16a = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.095, 0.085), mats.brushedSilver);
  x16a.position.set(-0.35, 0, 0);
  const x1 = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.085, 0.075), mats.matteBlackPlastic);
  x1.position.set(-0.78, 0, 0.24);
  const x16b = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.095, 0.085), mats.chassisSteel);
  x16b.position.set(-0.35, 0, 0.5);
  pcieGroup.add(x16a, x1, x16b);
  registerComponentPart(parts, interactables, 'mb_pcie', pcieGroup, [0, 0.075, 0.35], [-0.35, 0.5, 0.25], [-0.35, 0.16, 0.25]);
  root.add(pcieGroup);

  // 10. Conectores SATA (mb_sata)
  const sataGroup = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const port = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.09, 0.14),
      i < 2 ? mats.blueAccent : mats.matteBlackPlastic,
    );
    port.position.z = i * 0.16;
    sataGroup.add(port);
  }
  registerComponentPart(parts, interactables, 'mb_sata', sataGroup, [1.14, 0.075, 0.45], [0.65, 0.35, 0.15], [0, 0.14, 0.24]);
  root.add(sataGroup);

  // 11. Ranura M.2 NVMe (mb_m2)
  const m2Group = new THREE.Group();
  const m2Socket = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.055, 0.24),
    mats.matteBlackPlastic,
  );
  m2Socket.position.x = -0.38;
  const m2Ssd = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.02, 0.22),
    mats.pcbGreen,
  );
  m2Ssd.position.y = 0.025;
  const m2Heatsink = new THREE.Mesh(
    createBeveledPlateGeometry(0.78, 0.24, 0.045, 0.01),
    mats.aluminum,
  );
  m2Heatsink.rotation.x = Math.PI / 2;
  m2Heatsink.position.y = 0.07;
  m2Group.add(m2Socket, m2Ssd, m2Heatsink);
  registerComponentPart(parts, interactables, 'mb_m2', m2Group, [-0.32, 0.055, 0.06], [0, 0.72, 0], [0, 0.16, 0]);
  root.add(m2Group);

  // 12. VRM y disipadores (mb_vrm)
  const vrmGroup = new THREE.Group();
  const vrmTopSink = createHeatsinkFins(0.72, 0.22, 0.22, 8, mats.chassisSteel);
  vrmTopSink.position.set(-0.15, 0.12, -1.16);
  const vrmLeftSink = createHeatsinkFins(0.24, 0.24, 0.85, 10, mats.aluminum);
  vrmLeftSink.position.set(-0.74, 0.13, -0.62);
  // Chokes & Solid Caps around VRM
  const chokeGeo = new THREE.BoxGeometry(0.09, 0.07, 0.09);
  for (let i = 0; i < 6; i++) {
    const choke = new THREE.Mesh(chokeGeo, mats.chassisDark);
    choke.position.set(-0.55, 0.045, -0.95 + i * 0.13);
    vrmGroup.add(choke);
  }
  vrmGroup.add(vrmTopSink, vrmLeftSink);
  registerComponentPart(parts, interactables, 'mb_vrm', vrmGroup, [0, 0.03, 0], [-0.4, 0.78, -0.35], [-0.6, 0.3, -0.75]);
  root.add(vrmGroup);

  // 13. Puertos USB traseros (mb_usb)
  const usbGroup = new THREE.Group();
  const usbShell = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.32), mats.brushedSilver);
  const usbBlue = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.18), mats.blueAccent);
  usbBlue.position.set(-0.1, 0.05, 0);
  const usbBlue2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.03, 0.18), mats.blueAccent);
  usbBlue2.position.set(-0.1, -0.05, 0);
  usbGroup.add(usbShell, usbBlue, usbBlue2);
  registerComponentPart(parts, interactables, 'mb_usb', usbGroup, [-1.18, 0.15, -0.68], [-0.7, 0.35, 0], [-0.08, 0.22, 0]);
  root.add(usbGroup);

  // 14. Puerto Ethernet RJ45 (mb_ethernet)
  const ethGroup = new THREE.Group();
  const ethShell = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.22, 0.24), mats.brushedSilver);
  const ethLed = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.04), mats.ledBlue);
  ethLed.position.set(-0.13, 0.07, 0.07);
  ethGroup.add(ethShell, ethLed);
  registerComponentPart(parts, interactables, 'mb_ethernet', ethGroup, [-1.18, 0.14, -0.34], [-0.7, 0.35, 0.1], [-0.08, 0.2, 0]);
  root.add(ethGroup);

  // 15. Conectores de audio 3.5 mm (mb_audio)
  const audioGroup = new THREE.Group();
  const audioStack = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.26, 0.26), mats.chassisDark);
  const jackColors = [mats.blueAccent, mats.ledBlue, mats.redCable];
  for (let i = 0; i < 3; i++) {
    const jack = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.06, 12),
      jackColors[i],
    );
    jack.rotation.z = Math.PI / 2;
    jack.position.set(-0.11, -0.07 + i * 0.07, 0);
    audioGroup.add(jack);
  }
  audioGroup.add(audioStack);
  registerComponentPart(parts, interactables, 'mb_audio', audioGroup, [-1.18, 0.16, 0.05], [-0.7, 0.35, 0.25], [-0.08, 0.22, 0]);
  root.add(audioGroup);

  // 16. Puertos de video HDMI / DisplayPort (mb_video)
  const videoGroup = new THREE.Group();
  const vidShell = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.16, 0.28), mats.gold);
  const vidHole = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.16), mats.glossyBlack);
  vidHole.position.x = -0.1;
  videoGroup.add(vidShell, vidHole);
  registerComponentPart(parts, interactables, 'mb_video', videoGroup, [-1.18, 0.11, -1.06], [-0.7, 0.35, -0.2], [-0.08, 0.18, 0]);
  root.add(videoGroup);

  // 17. Conectores del panel frontal F_PANEL (mb_front_panel)
  const fPanelGroup = new THREE.Group();
  const fpBase = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.04, 0.12), mats.amberAccent);
  for (let x = 0; x < 5; x++) {
    for (let z = 0; z < 2; z++) {
      const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.09, 6), mats.gold);
      pin.position.set(-0.12 + x * 0.06, 0.05, -0.03 + z * 0.06);
      fPanelGroup.add(pin);
    }
  }
  fPanelGroup.add(fpBase);
  registerComponentPart(parts, interactables, 'mb_front_panel', fPanelGroup, [0.85, 0.05, 1.38], [0.25, 0.45, 0.55], [0, 0.15, 0]);
  root.add(fPanelGroup);

  // 18. Conectores de ventiladores PWM 4 pines (mb_fan_headers)
  const fanHeaderGroup = new THREE.Group();
  const fhBase = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.08), mats.chassisSteel);
  const fhGuide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.09, 0.02), mats.matteBlackPlastic);
  fhGuide.position.set(0, 0.04, -0.03);
  for (let p = 0; p < 4; p++) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.09, 6), mats.chrome);
    pin.position.set(-0.06 + p * 0.04, 0.05, 0.01);
    fanHeaderGroup.add(pin);
  }
  fanHeaderGroup.add(fhBase, fhGuide);
  registerComponentPart(parts, interactables, 'mb_fan_headers', fanHeaderGroup, [0.35, 0.05, -1.38], [0.15, 0.55, -0.45], [0, 0.15, 0]);
  root.add(fanHeaderGroup);

  return {
    root,
    parts,
    interactables,
    dispose: () => disposeGroupResources(root),
  };
}
