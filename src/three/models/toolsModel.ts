import * as THREE from 'three';
import type { MaterialPalette } from '../materials';
import { createTubeCable, disposeGroupResources } from './helpers';

export function buildWorkshopToolModel(
  toolId: string,
  mats: MaterialPalette,
): { root: THREE.Group; dispose: () => void } {
  const root = new THREE.Group();

  switch (toolId) {
    case 'tool_screwdriver': {
      // Handle + grip + shaft + magnetic Phillips tip
      const handle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.16, 1.15, 16),
        mats.blueAccent,
      );
      handle.position.y = -0.55;
      const collar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16),
        mats.rubber,
      );
      collar.position.y = 0.02;
      const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.16, 14, 12),
        mats.chassisSteel,
      );
      cap.position.y = -1.12;
      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.042, 0.042, 1.15, 12),
        mats.chrome,
      );
      shaft.position.y = 0.65;
      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.18, 4),
        mats.chassisDark,
      );
      tip.position.y = 1.3;
      root.add(handle, collar, cap, shaft, tip);
      root.rotation.z = -0.42;
      break;
    }

    case 'tool_brush': {
      const handle = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 1.3, 0.09),
        mats.matteBlackPlastic,
      );
      handle.position.y = -0.45;
      const ferrule = new THREE.Mesh(
        new THREE.BoxGeometry(0.48, 0.22, 0.14),
        mats.brushedSilver,
      );
      ferrule.position.y = 0.25;
      const bristles = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.65, 0.12),
        mats.fanBlade,
      );
      bristles.position.y = 0.68;
      const esdStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.18, 0.1),
        mats.amberAccent,
      );
      esdStripe.position.y = -0.6;
      root.add(handle, ferrule, bristles, esdStripe);
      root.rotation.z = -0.3;
      break;
    }

    case 'tool_air': {
      const can = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 1.65, 24),
        mats.chassisSteel,
      );
      const labelBand = new THREE.Mesh(
        new THREE.CylinderGeometry(0.425, 0.425, 0.95, 24),
        mats.blueAccent,
      );
      const shoulder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.42, 0.24, 24),
        mats.brushedSilver,
      );
      shoulder.position.y = 0.94;
      const nozzleHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.15, 0.24, 16),
        mats.redCable,
      );
      nozzleHead.position.y = 1.15;
      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.016, 0.016, 0.95, 8),
        mats.redCable,
      );
      straw.rotation.z = Math.PI / 2 - 0.15;
      straw.position.set(0.55, 1.24, 0);
      root.add(can, labelBand, shoulder, nozzleHead, straw);
      break;
    }

    case 'tool_ipa': {
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.44, 0.46, 1.45, 24),
        mats.temperedGlass,
      );
      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.42, 1.05, 20),
        mats.blueAccent,
      );
      liquid.position.y = -0.15;
      const label = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 0.65, 24),
        mats.chassisDark,
      );
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(0.15, 0.36, 0.22, 20),
        mats.matteBlackPlastic,
      );
      neck.position.y = 0.82;
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.26, 18),
        mats.ledBlue,
      );
      cap.position.y = 1.04;
      root.add(bottle, liquid, label, neck, cap);
      break;
    }

    case 'tool_microfiber': {
      const clothBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.45, 0.1, 1.25),
        mats.blueAccent,
      );
      const foldTop = new THREE.Mesh(
        new THREE.BoxGeometry(1.38, 0.09, 0.95),
        mats.ledBlue,
      );
      foldTop.position.set(0.02, 0.11, -0.08);
      foldTop.rotation.y = 0.06;
      const stitch = new THREE.Mesh(
        new THREE.BoxGeometry(1.47, 0.02, 1.27),
        mats.chassisDark,
      );
      stitch.position.y = -0.04;
      root.add(clothBase, foldTop, stitch);
      root.rotation.x = 0.35;
      break;
    }

    case 'tool_esd_strap': {
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.09, 12, 28),
        mats.blueAccent,
      );
      band.rotation.x = Math.PI / 2;
      const snapPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.08, 0.24),
        mats.chassisDark,
      );
      snapPlate.position.set(0.42, 0.05, 0);
      const snapStud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12),
        mats.chrome,
      );
      snapStud.position.set(0.42, 0.1, 0);
      const cord = createTubeCable(
        [
          [0.42, 0.05, 0],
          [0.85, -0.1, 0.3],
          [0.65, -0.25, 0.65],
          [1.05, -0.35, 0.9],
        ],
        0.028,
        mats.matteBlackPlastic,
        24,
      );
      const clip = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.09, 0.11),
        mats.chrome,
      );
      clip.position.set(1.12, -0.35, 0.92);
      root.add(band, snapPlate, snapStud, cord, clip);
      root.position.set(-0.3, 0.2, -0.2);
      break;
    }

    case 'tool_thermal_paste': {
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 1.25, 18),
        mats.chassisSteel,
      );
      const flange = new THREE.Mesh(
        new THREE.BoxGeometry(0.46, 0.06, 0.26),
        mats.blueAccent,
      );
      flange.position.y = -0.6;
      const plunger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.75, 12),
        mats.amberAccent,
      );
      plunger.position.y = -0.95;
      const nozzle = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.42, 14),
        mats.matteBlackPlastic,
      );
      nozzle.position.y = 0.82;
      const pasteDrop = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 12, 12),
        mats.aluminum,
      );
      pasteDrop.position.y = 1.05;
      root.add(barrel, flange, plunger, nozzle, pasteDrop);
      root.rotation.z = -0.5;
      break;
    }

    case 'tool_tweezers':
    default: {
      const arm1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.55, 0.12),
        mats.chassisSteel,
      );
      arm1.position.x = -0.055;
      arm1.rotation.z = -0.045;
      const arm2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 1.55, 0.12),
        mats.chassisSteel,
      );
      arm2.position.x = 0.055;
      arm2.rotation.z = 0.045;
      const weld = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.22, 0.13),
        mats.matteBlackPlastic,
      );
      weld.position.y = -0.72;
      const tip1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.22, 8),
        mats.chrome,
      );
      tip1.position.set(-0.02, 0.86, 0);
      const tip2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.025, 0.22, 8),
        mats.chrome,
      );
      tip2.position.set(0.02, 0.86, 0);
      root.add(arm1, arm2, weld, tip1, tip2);
      root.rotation.z = -0.35;
      break;
    }
  }

  root.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return {
    root,
    dispose: () => disposeGroupResources(root),
  };
}
