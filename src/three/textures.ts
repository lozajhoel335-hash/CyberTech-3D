import * as THREE from 'three';

export function createPcbTexture(
  baseHex = '#0D2238',
  traceHex = '#1E4D7B',
  silkHex = '#94A3B8',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = baseHex;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle fiberglass weave grid
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 512; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  // Copper PCB traces
  ctx.strokeStyle = traceHex;
  ctx.lineWidth = 2.2;
  for (let i = 0; i < 36; i++) {
    const startX = ((i * 53) % 440) + 32;
    const startY = ((i * 97) % 440) + 32;
    const len = 40 + ((i * 29) % 110);
    const diag = 18 + (i % 24);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + len * 0.5, startY);
    ctx.lineTo(startX + len * 0.5 + diag, startY + diag);
    ctx.lineTo(startX + len + diag, startY + diag);
    ctx.stroke();

    // Parallel differential trace
    ctx.beginPath();
    ctx.moveTo(startX, startY + 5);
    ctx.lineTo(startX + len * 0.5 - 2, startY + 5);
    ctx.lineTo(startX + len * 0.5 + diag - 2, startY + diag + 5);
    ctx.lineTo(startX + len + diag, startY + diag + 5);
    ctx.stroke();
  }

  // Gold vias and pads
  ctx.fillStyle = '#D4AF37';
  for (let i = 0; i < 48; i++) {
    const vx = ((i * 71) % 470) + 20;
    const vy = ((i * 113) % 470) + 20;
    ctx.beginPath();
    ctx.arc(vx, vy, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Silkscreen markings
  ctx.strokeStyle = silkHex;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.35;
  ctx.strokeRect(18, 18, 476, 476);
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = silkHex;
  ctx.fillText('PC-MASTER REV 4.2', 28, 36);
  ctx.fillText('ATX-PCB // ESD SAFE', 340, 488);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createBrushedMetalBumpTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y++) {
    const shade = 112 + ((y * 37) % 32);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMeshGrilleTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#141B29';
  ctx.fillRect(0, 0, 128, 128);

  ctx.fillStyle = '#05080F';
  for (let y = 4; y < 128; y += 8) {
    const offset = (y / 8) % 2 === 0 ? 0 : 4;
    for (let x = 4; x < 128; x += 8) {
      ctx.beginPath();
      ctx.arc((x + offset) % 128, y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 6);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createScreenDisplayTexture(
  title: string,
  subtitle: string,
  accent = '#38BDF8',
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 320);
  grad.addColorStop(0, '#091428');
  grad.addColorStop(0.55, '#0F2547');
  grad.addColorStop(1, '#071122');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 320);

  // Subtle diagnostic grid
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 320);
    ctx.stroke();
  }
  for (let y = 0; y <= 320; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Diagnostic ring
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(256, 145, 58, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 145, 72, 0.2, Math.PI * 1.6);
  ctx.stroke();

  ctx.fillStyle = '#F8FAFC';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(title, 256, 246);

  ctx.fillStyle = accent;
  ctx.font = '600 15px monospace';
  ctx.fillText(subtitle, 256, 274);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createBatteryWarningTexture(
  label: string,
  voltage: string,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 384;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#181C24';
  ctx.fillRect(0, 0, 256, 384);

  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, 232, 360);

  // Warning header band
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(12, 12, 232, 54);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('LI-ION // PRECAUCIÓN', 128, 46);

  ctx.fillStyle = '#F8FAFC';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(label, 128, 125);

  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(voltage, 128, 162);

  ctx.fillStyle = '#FBBF24';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('NO PERFORAR', 128, 235);
  ctx.fillText('NO DOBLAR', 128, 260);
  ctx.fillText('NO EXPONER A CALOR', 128, 285);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}
