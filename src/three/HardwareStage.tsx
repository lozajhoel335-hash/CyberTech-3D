import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { CameraPresetId, ComponentInfo, DeviceModelType } from '../types/hardware';
import { getCameraPresetTransform } from '../utils/labLogic';
import { createMaterialPalette } from './materials';
import { buildDesktopPCModel } from './models/desktopModel';
import { type BuiltHardwareModel } from './models/helpers';
import { buildLaptopModel } from './models/laptopModel';
import { buildMotherboardModel } from './models/motherboardModel';
import { buildPhoneModel } from './models/phoneModel';
import { buildWorkshopToolModel } from './models/toolsModel';

export interface HardwareStageProps {
  modelType: DeviceModelType | 'tool';
  toolId?: string;
  components?: ComponentInfo[];
  selectedId: string | null;
  hoveredId?: string | null;
  onSelectComponent?: (id: string | null) => void;
  onHoverComponent?: (id: string | null) => void;
  explodeAmount?: number; // 0..1
  laptopLidOpen?: boolean;
  showLabels?: boolean;
  autoRotate?: boolean;
  cameraPresetTrigger?: { id: CameraPresetId; seq: number };
  zoomTrigger?: { delta: number; seq: number };
  compact?: boolean;
  testId?: string;
}

// Pre-allocated scratch math helpers (zero GC inside render loop)
const _scratchVec3 = new THREE.Vector3();
const _scratchAnchor = new THREE.Vector3();
const _scratchCamTarget = new THREE.Vector3();
const _scratchCamPos = new THREE.Vector3();
const _highlightColor = new THREE.Color(0x0ea5e9);
const _hoverColor = new THREE.Color(0x38bdf8);
const _blackColor = new THREE.Color(0x000000);

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
  grad.addColorStop(0, 'rgba(2, 6, 23, 0.72)');
  grad.addColorStop(0.55, 'rgba(2, 6, 23, 0.28)');
  grad.addColorStop(1, 'rgba(2, 6, 23, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export default function HardwareStage({
  modelType,
  toolId = 'tool_screwdriver',
  components = [],
  selectedId,
  onSelectComponent,
  onHoverComponent,
  explodeAmount = 0,
  laptopLidOpen = true,
  showLabels = false,
  autoRotate = false,
  cameraPresetTrigger,
  zoomTrigger,
  compact = false,
  testId = 'hardware-stage',
}: HardwareStageProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const arrowLineRefs = useRef<Map<string, SVGLineElement>>(new Map());
  const arrowDotRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const mountedKeyRef = useRef<string>(`${modelType}|${toolId}`);
  const [contextLost, setContextLost] = useState(false);

  // Mutable state bridge so React prop updates never re-create WebGLRenderer
  const stateRef = useRef({
    modelType,
    toolId,
    selectedId,
    explodeTarget: explodeAmount,
    explodeCurrent: explodeAmount,
    lidTarget: laptopLidOpen ? 1 : 0,
    lidCurrent: laptopLidOpen ? 1 : 0,
    showLabels,
    autoRotate,
    hoveredId: null as string | null,
    onSelectComponent,
    onHoverComponent,
    camAnimating: false,
    camGoalPos: new THREE.Vector3(3.6, 2.2, 3.6),
    camGoalTarget: new THREE.Vector3(0, 0.1, 0),
    requestRender: () => {},
    rebuildModel: () => {},
    applyZoom: (_delta: number) => {},
  });

  stateRef.current.selectedId = selectedId;
  stateRef.current.explodeTarget = explodeAmount;
  stateRef.current.lidTarget = laptopLidOpen ? 1 : 0;
  stateRef.current.showLabels = showLabels;
  stateRef.current.autoRotate = autoRotate;
  stateRef.current.onSelectComponent = onSelectComponent;
  stateRef.current.onHoverComponent = onHoverComponent;

  // Mount Three.js scene & renderer once
  useEffect(() => {
    const mount = mountRef.current;
    const container = containerRef.current;
    if (!mount || !container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = Math.max(container.clientWidth, 320);
    const height = Math.max(container.clientHeight, 260);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
    );
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b14);
    scene.fog = new THREE.FogExp2(0x070b14, 0.036);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    roomEnv.dispose();
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 80);
    const initialPreset = getCameraPresetTransform(
      stateRef.current.modelType === 'tool' ? 'phone' : stateRef.current.modelType,
      'default',
    );
    camera.position.set(...initialPreset.position);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.07;
    controls.minDistance = 1.6;
    controls.maxDistance = 12;
    controls.maxPolarAngle = Math.PI * 0.92;
    controls.target.set(...initialPreset.target);
    controls.update();

    // Three-point warm/cool studio lighting
    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e6, 1.9);
    keyLight.position.set(4.5, 6.5, 5.0);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-4.5, 3.5, -5.0);
    scene.add(rimLight);

    // Subtle workbench floor grid & radial contact shadow
    const gridHelper = new THREE.GridHelper(16, 24, 0x1e3a5f, 0x0f1a2e);
    gridHelper.position.y = -1.52;
    scene.add(gridHelper);

    const shadowTex = createRadialShadowTexture();
    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 32),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
      }),
    );
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -1.5;
    scene.add(contactShadow);

    const maxAnisotropy = isSoftwareGl
      ? 1
      : Math.min(renderer.capabilities.getMaxAnisotropy(), 8);
    const palette = createMaterialPalette(isSoftwareGl, maxAnisotropy);

    // Active model holder
    let activeModel: BuiltHardwareModel | null = null;
    let activeToolModel: { root: THREE.Group; dispose: () => void } | null = null;
    const clonedMaterials = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
    let lastHighlightedKey = '';

    const clearCurrentModel = () => {
      lastHighlightedKey = '';
      clonedMaterials.forEach((origMat, mesh) => {
        if (mesh.material !== origMat) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
          mesh.material = origMat;
        }
      });
      clonedMaterials.clear();

      if (activeModel) {
        scene.remove(activeModel.root);
        activeModel.dispose();
        activeModel = null;
      }
      if (activeToolModel) {
        scene.remove(activeToolModel.root);
        activeToolModel.dispose();
        activeToolModel = null;
      }
    };

    const rebuildModel = () => {
      clearCurrentModel();
      const mType = stateRef.current.modelType;
      const tId = stateRef.current.toolId;

      if (mType === 'tool') {
        activeToolModel = buildWorkshopToolModel(tId, palette);
        scene.add(activeToolModel.root);
        camera.position.set(2.2, 1.4, 2.7);
        controls.target.set(0, 0, 0);
        gridHelper.position.y = -1.35;
        contactShadow.position.y = -1.33;
      } else {
        if (mType === 'desktop') {
          activeModel = buildDesktopPCModel(palette);
          gridHelper.position.y = -1.32;
          contactShadow.position.y = -1.3;
        } else if (mType === 'motherboard') {
          activeModel = buildMotherboardModel(palette);
          gridHelper.position.y = -0.8;
          contactShadow.position.y = -0.78;
        } else if (mType === 'laptop') {
          activeModel = buildLaptopModel(palette, maxAnisotropy);
          gridHelper.position.y = -0.65;
          contactShadow.position.y = -0.63;
        } else {
          activeModel = buildPhoneModel(palette, maxAnisotropy);
          gridHelper.position.y = -1.38;
          contactShadow.position.y = -1.36;
        }
        scene.add(activeModel.root);

        const preset = getCameraPresetTransform(mType, 'default');
        camera.position.set(...preset.position);
        controls.target.set(...preset.target);
        stateRef.current.camGoalPos.set(...preset.position);
        stateRef.current.camGoalTarget.set(...preset.target);
        stateRef.current.camAnimating = false;
      }
      controls.update();
    };

    rebuildModel();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster restricted to layer 1
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;

    const findComponentId = (obj: THREE.Object3D | null): string | null => {
      let cur: THREE.Object3D | null = obj;
      while (cur) {
        if (typeof cur.userData.componentId === 'string') {
          return cur.userData.componentId;
        }
        cur = cur.parent;
      }
      return null;
    };

    const updateMouseNdc = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!activeModel || !stateRef.current.onSelectComponent) return;
      const dist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y,
      );
      if (dist > 6) return; // Was an orbit drag, not a click

      updateMouseNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(activeModel.interactables, true);
      if (hits.length > 0) {
        const compId = findComponentId(hits[0].object);
        if (compId) {
          stateRef.current.onSelectComponent(compId);
          requestRender();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!activeModel) return;
      const now = performance.now();
      if (now - lastHoverTime < 65) return;
      lastHoverTime = now;

      updateMouseNdc(e);
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(activeModel.interactables, true);
      const hitId = hits.length > 0 ? findComponentId(hits[0].object) : null;
      if (hitId !== stateRef.current.hoveredId) {
        stateRef.current.hoveredId = hitId;
        renderer.domElement.style.cursor = hitId ? 'pointer' : 'grab';
        stateRef.current.onHoverComponent?.(hitId);
        requestRender();
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    const onControlsStart = () => {
      stateRef.current.camAnimating = false;
    };
    const onControlsChange = () => {
      requestRender();
    };
    controls.addEventListener('start', onControlsStart);
    controls.addEventListener('change', onControlsChange);

    // Highlight application helper (only clones material on highlighted mesh to preserve shared batching)
    const syncHighlightMaterials = () => {
      if (!activeModel) return;
      const sId = stateRef.current.selectedId;
      const hId = stateRef.current.hoveredId;
      const key = `${sId ?? ''}|${hId ?? ''}`;
      if (key === lastHighlightedKey) return;
      lastHighlightedKey = key;

      // Restore previous clones
      clonedMaterials.forEach((origMat, mesh) => {
        if (mesh.material !== origMat) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
          mesh.material = origMat;
        }
      });
      clonedMaterials.clear();

      activeModel.parts.forEach((entry, partId) => {
        const isSel = partId === sId;
        const isHov = partId === hId && !isSel;
        if (!isSel && !isHov) return;

        entry.group.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (!mesh.isMesh || Array.isArray(mesh.material)) return;
          const std = mesh.material as THREE.MeshStandardMaterial;
          if (!std || !('emissive' in std)) return;
          clonedMaterials.set(mesh, std);
          const clone = std.clone();
          clone.emissive.copy(isSel ? _highlightColor : _hoverColor);
          clone.emissiveIntensity = isSel ? 0.55 : 0.3;
          mesh.material = clone;
        });
      });
    };

    // Update 2D projected floating labels + SVG indicator arrows directly via DOM refs
    const updateFloatingLabels = () => {
      if (!activeModel || !container) return;
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      const visible = stateRef.current.showLabels;
      const sel = stateRef.current.selectedId;

      activeModel.parts.forEach((entry, partId) => {
        const labelEl = labelRefs.current.get(partId);
        const lineEl = arrowLineRefs.current.get(partId);
        const dotEl = arrowDotRefs.current.get(partId);
        const shouldShow = visible || sel === partId;

        if (!shouldShow) {
          if (labelEl) labelEl.style.opacity = '0';
          if (labelEl) labelEl.style.pointerEvents = 'none';
          if (lineEl) lineEl.style.opacity = '0';
          if (dotEl) dotEl.style.opacity = '0';
          return;
        }

        // Compute world anchor position
        entry.group.updateWorldMatrix(true, false);
        _scratchAnchor.copy(entry.labelAnchor).applyMatrix4(entry.group.matrixWorld);
        _scratchVec3.copy(_scratchAnchor).project(camera);

        if (_scratchVec3.z > 1 || _scratchVec3.z < -1) {
          if (labelEl) labelEl.style.opacity = '0';
          if (labelEl) labelEl.style.pointerEvents = 'none';
          if (lineEl) lineEl.style.opacity = '0';
          if (dotEl) dotEl.style.opacity = '0';
          return;
        }

        const anchorX = ((_scratchVec3.x + 1) / 2) * cW;
        const anchorY = ((-_scratchVec3.y + 1) / 2) * cH;

        // Slight radial push outward from viewport center for cleaner label spacing
        const dx = anchorX - cW * 0.5;
        const dy = anchorY - cH * 0.5;
        const len = Math.max(Math.hypot(dx, dy), 1);
        const push = sel === partId ? 38 : 26;
        const labelX = Math.max(58, Math.min(cW - 58, anchorX + (dx / len) * push));
        const minTopY = anchorX < 460 ? 84 : 28;
        const labelY = Math.max(minTopY, Math.min(cH - 160, anchorY + (dy / len) * push - 14));

        if (labelEl) {
          labelEl.style.opacity = '1';
          labelEl.style.pointerEvents = 'auto';
          labelEl.style.transform = `translate3d(${labelX}px, ${labelY}px, 0) translate(-50%, -50%)`;
        }
        if (lineEl) {
          lineEl.style.opacity = '1';
          lineEl.setAttribute('x1', labelX.toFixed(1));
          lineEl.setAttribute('y1', labelY.toFixed(1));
          lineEl.setAttribute('x2', anchorX.toFixed(1));
          lineEl.setAttribute('y2', anchorY.toFixed(1));
        }
        if (dotEl) {
          dotEl.style.opacity = '1';
          dotEl.setAttribute('cx', anchorX.toFixed(1));
          dotEl.setAttribute('cy', anchorY.toFixed(1));
        }
      });
    };

    // On-demand render & software-WebGL afterDraw pacing
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let disposed = false;
    let lastTickTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync?.(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function requestRender() {
      if (disposed) return;
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        if (disposed) return;
        renderDirty = false;
        const now = performance.now();
        const delta = Math.min((now - lastTickTime) / 1000, 0.1);
        lastTickTime = now;

        const st = stateRef.current;
        let needsAnotherFrame = false;

        // Smooth exploded-view damping
        if (Math.abs(st.explodeTarget - st.explodeCurrent) > 0.002) {
          st.explodeCurrent = THREE.MathUtils.damp(
            st.explodeCurrent,
            st.explodeTarget,
            7.5,
            delta,
          );
          needsAnotherFrame = true;
        } else {
          st.explodeCurrent = st.explodeTarget;
        }

        // Smooth laptop lid damping
        if (Math.abs(st.lidTarget - st.lidCurrent) > 0.002) {
          st.lidCurrent = THREE.MathUtils.damp(
            st.lidCurrent,
            st.lidTarget,
            7.0,
            delta,
          );
          needsAnotherFrame = true;
        } else {
          st.lidCurrent = st.lidTarget;
        }

        if (activeModel) {
          const eProg = st.explodeCurrent;
          activeModel.parts.forEach((entry) => {
            entry.group.position.set(
              entry.basePos.x + entry.explodeOffset.x * eProg,
              entry.basePos.y + entry.explodeOffset.y * eProg,
              entry.basePos.z + entry.explodeOffset.z * eProg,
            );
          });

          // Swing/slide desktop glass door outward when opening PC
          if (activeModel.animatedExtra?.doorGroup) {
            const door = activeModel.animatedExtra.doorGroup;
            door.position.x = 0.61 + eProg * 1.15;
            door.rotation.y = -eProg * 0.25;
          }

          // Laptop lid articulation: 0 = closed (Math.PI / 2 folded down), 1 = open (-0.35 rad)
          if (activeModel.animatedExtra?.lidGroup) {
            const lid = activeModel.animatedExtra.lidGroup;
            const closedAngle = Math.PI * 0.49;
            const openAngle = -0.35;
            lid.rotation.x = THREE.MathUtils.lerp(
              closedAngle,
              openAngle,
              st.lidCurrent,
            );
            lid.position.y = 0.04 + eProg * 0.65;
            lid.position.z = -0.94 - eProg * 0.35;
          }

          // Subtle fan rotation when autoRotate is enabled
          if (st.autoRotate && activeModel.animatedExtra?.fanRotors) {
            for (const rotor of activeModel.animatedExtra.fanRotors) {
              rotor.rotation.z += delta * 4.5;
            }
          }
        }

        // Smooth camera preset transition
        if (st.camAnimating) {
          camera.position.lerp(st.camGoalPos, 1 - Math.exp(-8 * delta));
          controls.target.lerp(st.camGoalTarget, 1 - Math.exp(-8 * delta));
          if (
            camera.position.distanceTo(st.camGoalPos) < 0.015 &&
            controls.target.distanceTo(st.camGoalTarget) < 0.015
          ) {
            camera.position.copy(st.camGoalPos);
            controls.target.copy(st.camGoalTarget);
            st.camAnimating = false;
          } else {
            needsAnotherFrame = true;
          }
        }

        // Auto-rotate around target if requested
        if (st.autoRotate) {
          if (activeToolModel) {
            activeToolModel.root.rotation.y += delta * 0.85;
          } else if (activeModel) {
            activeModel.root.rotation.y += delta * 0.45;
          }
          needsAnotherFrame = true;
        } else if (activeModel && Math.abs(activeModel.root.rotation.y) > 0.001) {
          // Keep current angle until reset
        }

        syncHighlightMaterials();
        controls.update();
        renderer.render(scene, camera);
        updateFloatingLabels();

        const done = () => {
          renderBusy = false;
          if (renderDirty || needsAnotherFrame) {
            requestRender();
          }
        };
        if (isSoftwareGl) {
          afterDraw(done);
        } else {
          done();
        }
      });
    }

    stateRef.current.requestRender = requestRender;
    stateRef.current.rebuildModel = () => {
      rebuildModel();
      requestRender();
    };
    stateRef.current.applyZoom = (factor: number) => {
      _scratchCamPos.copy(camera.position).sub(controls.target);
      const nextLen = THREE.MathUtils.clamp(
        _scratchCamPos.length() * factor,
        controls.minDistance,
        controls.maxDistance,
      );
      _scratchCamPos.setLength(nextLen).add(controls.target);
      stateRef.current.camGoalPos.copy(_scratchCamPos);
      stateRef.current.camGoalTarget.copy(controls.target);
      stateRef.current.camAnimating = true;
      requestRender();
    };

    const resizeObserver = new ResizeObserver(() => {
      if (!container || disposed) return;
      const w = Math.max(container.clientWidth, 240);
      const h = Math.max(container.clientHeight, 220);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    resizeObserver.observe(container);

    requestRender();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      controls.removeEventListener('start', onControlsStart);
      controls.removeEventListener('change', onControlsChange);
      controls.dispose();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      clearCurrentModel();
      palette.dispose();
      shadowTex.dispose();
      gridHelper.geometry.dispose();
      (gridHelper.material as THREE.Material).dispose();
      contactShadow.geometry.dispose();
      (contactShadow.material as THREE.Material).dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      _blackColor.setHex(0x000000);
      _scratchCamTarget.set(0, 0, 0);
    };
  }, []);

  // Rebuild model only when modelType or toolId changes after initial mount
  useEffect(() => {
    const nextKey = `${modelType}|${toolId}`;
    if (mountedKeyRef.current === nextKey) return;
    mountedKeyRef.current = nextKey;
    stateRef.current.modelType = modelType;
    stateRef.current.toolId = toolId;
    stateRef.current.explodeCurrent = explodeAmount;
    stateRef.current.explodeTarget = explodeAmount;
    stateRef.current.rebuildModel();
  }, [modelType, toolId]);

  // Trigger render when props change
  useEffect(() => {
    stateRef.current.requestRender();
  }, [selectedId, explodeAmount, laptopLidOpen, showLabels, autoRotate]);

  // Apply camera preset transitions
  useEffect(() => {
    if (!cameraPresetTrigger || stateRef.current.modelType === 'tool') return;
    const preset = getCameraPresetTransform(
      stateRef.current.modelType,
      cameraPresetTrigger.id,
    );
    stateRef.current.camGoalPos.set(...preset.position);
    stateRef.current.camGoalTarget.set(...preset.target);
    stateRef.current.camAnimating = true;
    stateRef.current.requestRender();
  }, [cameraPresetTrigger?.id, cameraPresetTrigger?.seq]);

  // Apply zoom trigger
  useEffect(() => {
    if (!zoomTrigger) return;
    stateRef.current.applyZoom(zoomTrigger.delta);
  }, [zoomTrigger?.seq]);

  return (
    <div
      ref={containerRef}
      data-testid={testId}
      data-model={modelType}
      data-exploded={explodeAmount > 0.1 ? 'true' : 'false'}
      data-selected={selectedId ?? ''}
      className={`relative w-full h-full overflow-hidden select-none bg-[#070B14] ${
        compact ? 'rounded-xl border border-slate-800' : ''
      }`}
    >
      {/* Dedicated empty Three.js WebGL mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* SVG Indicator Arrows Overlay (zero backdrop-blur) */}
      {modelType !== 'tool' && components.length > 0 && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 w-full h-full z-10"
        >
          {components.map((comp) => {
            const isSel = selectedId === comp.id;
            return (
              <g key={comp.id}>
                <line
                  ref={(el) => {
                    if (el) arrowLineRefs.current.set(comp.id, el);
                    else arrowLineRefs.current.delete(comp.id);
                  }}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="0"
                  stroke={isSel ? '#38BDF8' : 'rgba(148, 163, 184, 0.72)'}
                  strokeWidth={isSel ? 2 : 1.25}
                  strokeDasharray={isSel ? undefined : '3 3'}
                  style={{ opacity: 0, transition: 'stroke 150ms ease' }}
                />
                <circle
                  ref={(el) => {
                    if (el) arrowDotRefs.current.set(comp.id, el);
                    else arrowDotRefs.current.delete(comp.id);
                  }}
                  cx="0"
                  cy="0"
                  r={isSel ? 4.5 : 3}
                  fill={isSel ? '#38BDF8' : '#60A5FA'}
                  stroke="#070B14"
                  strokeWidth="1.5"
                  style={{ opacity: 0 }}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* Floating Selectable 3D Labels (positioned via direct DOM transform) */}
      {modelType !== 'tool' && components.length > 0 && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          {components.map((comp) => {
            const isSel = selectedId === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                ref={(el) => {
                  if (el) labelRefs.current.set(comp.id, el);
                  else labelRefs.current.delete(comp.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent?.(comp.id);
                }}
                aria-label={`Inspeccionar ${comp.name}`}
                style={{
                  opacity: 0,
                  left: 0,
                  top: 0,
                  position: 'absolute',
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap border transition-colors cursor-pointer ${
                  isSel
                    ? 'bg-blue-600 text-white border-sky-300 shadow-lg'
                    : 'bg-[#0B1222]/90 text-slate-200 border-slate-700/90 hover:border-sky-400 hover:text-white'
                }`}
              >
                {comp.shortLabel}
              </button>
            );
          })}
        </div>
      )}

      {contextLost && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#070B14]/95 p-6 text-center">
          <div className="max-w-sm space-y-2">
            <p className="text-base font-semibold text-white">
              Contexto 3D pausado temporalmente
            </p>
            <p className="text-sm text-slate-400">
              El navegador liberó memoria gráfica. Recarga la vista para restablecer el visor interactivo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
