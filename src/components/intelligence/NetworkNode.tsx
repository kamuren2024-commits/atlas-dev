import React from 'react';
import { CameraState, NetworkNode3D } from './types';
import { project3D, drawLine3D } from './GridEnvironment';

interface NodeProps {
  ctx: CanvasRenderingContext2D;
  camera: CameraState;
  width: number;
  height: number;
  node: NetworkNode3D;
  isSelected: boolean;
  timeSec: number;
}

export function drawNetworkNode({ ctx, camera, width, height, node, isSelected, timeSec }: NodeProps) {
  const proj = project3D(node.pos, camera, width, height);
  if (!proj.visible) return;

  // 1. ELEVATION COLUMN (Pillar connecting floating node to ground plane at z:0)
  const floorPos = { ...node.pos, z: 0 };
  const floorProj = project3D(floorPos, camera, width, height);

  ctx.save();
  // Cyan-blue dashboard style elevated pillars
  ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.4)' : 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 5]);
  
  // Draw vertical line
  ctx.beginPath();
  ctx.moveTo(floorProj.x, floorProj.y);
  ctx.lineTo(proj.x, proj.y);
  ctx.stroke();
  ctx.restore();

  // 2. GROUND PLANE RING FOOTPRINT & LAT/LONG METADATA
  if (floorProj.visible) {
    ctx.save();
    const groundR = 14 * floorProj.scale;
    // Ground footprint glow ring
    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.35)' : 'rgba(148, 163, 184, 0.08)';
    ctx.lineWidth = isSelected ? 1.5 : 1;
    ctx.beginPath();
    ctx.ellipse(floorProj.x, floorProj.y, groundR, groundR * Math.cos(camera.pitch), 0, 0, Math.PI * 2);
    ctx.stroke();

    if (isSelected) {
      // Spinning tick indicator on floor
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.beginPath();
      const startAngle = timeSec * 0.8;
      ctx.ellipse(floorProj.x, floorProj.y, groundR + 4, (groundR + 4) * Math.cos(camera.pitch), 0, startAngle, startAngle + 0.5);
      ctx.ellipse(floorProj.x, floorProj.y, groundR + 4, (groundR + 4) * Math.cos(camera.pitch), 0, startAngle + Math.PI, startAngle + Math.PI + 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 3. NODE STATE COLOR MACHINE & HALOS
  // Breathing scale factor 0.85 to 1.15 based on oscillation rate and distinct phase offset
  const breathFreq = node.status === 'critical' ? 4 : 1.5;
  const breath = Math.sin(timeSec * breathFreq + node.phaseOffset) * 0.12 + 1;
  const radius = (node.type === 'primary' ? 10 : 7) * proj.scale * breath;

  let coreColor = '#10b981'; // healthy green
  let glowColor = 'rgba(16, 185, 129, 0.15)';
  let haloStroke = 'rgba(16, 185, 129, 0.35)';

  if (node.status === 'warning') {
    coreColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.2)';
    haloStroke = 'rgba(245, 158, 11, 0.5)';
  } else if (node.status === 'critical') {
    // Red active flicker and bright pulse
    const flicker = Math.random() > 0.95 ? 0.3 : 1;
    coreColor = `rgba(239, 68, 68, ${flicker})`;
    glowColor = `rgba(239, 68, 68, ${0.45 * flicker})`;
    haloStroke = `rgba(239, 68, 68, ${0.85 * flicker})`;
  } else if (node.status === 'offline') {
    coreColor = '#64748b'; // slate grey
    glowColor = 'rgba(100, 116, 139, 0.05)';
    haloStroke = 'rgba(100, 116, 139, 0.2)';
  }

  if (isSelected) {
    coreColor = '#ffffff'; // White hotspot inside focused node
    glowColor = 'rgba(56, 189, 248, 0.5)';
    haloStroke = 'rgba(56, 189, 248, 0.95)';
  }

  // A. Outer Pulse Halo
  ctx.save();
  ctx.shadowBlur = 15;
  ctx.shadowColor = isSelected ? '#38bdf8' : coreColor;
  
  // Ambient radial glow fill
  const nodeGrad = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, radius * 3.5);
  nodeGrad.addColorStop(0, glowColor);
  nodeGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
  nodeGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = nodeGrad;
  ctx.beginPath();
  ctx.arc(proj.x, proj.y, radius * 3.5, 0, Math.PI * 2);
  ctx.fill();

  // B. Physical outline / rings
  ctx.strokeStyle = haloStroke;
  ctx.lineWidth = isSelected ? 2 : 1.5;
  ctx.beginPath();
  ctx.arc(proj.x, proj.y, radius + (isSelected ? 5 : 3), 0, Math.PI * 2);
  ctx.stroke();

  // Extra micro rotating dashboard rings for primary strategic substations
  if (node.type === 'primary') {
    ctx.strokeStyle = isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(99, 102, 241, 0.15)';
    ctx.setLineDash([2, 4]);
    ctx.beginPath();
    ctx.arc(proj.x, proj.y, radius + (isSelected ? 10 : 8), timeSec * 0.5, timeSec * 0.5 + Math.PI * 1.5);
    ctx.stroke();
  }

  // C. Solid Hotspot Core
  ctx.restore();
  ctx.save();
  ctx.fillStyle = coreColor;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 2 * proj.scale;
  ctx.beginPath();
  ctx.arc(proj.x, proj.y, radius * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // 4. FLOATING HUD DATA LABELS
  ctx.save();
  // Name overlay
  ctx.fillStyle = isSelected ? '#38bdf8' : '#e2e8f0';
  ctx.font = `bold ${Math.floor(Math.max(9, 10.5 * proj.scale))}px "Space Grotesk", sans-serif`;
  ctx.textAlign = 'center';
  
  // Drop subtle shadow under details to pop out perfectly from grid background lines
  ctx.shadowColor = '#010309';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 1;

  ctx.fillText(node.name, proj.x, proj.y - radius - (isSelected ? 16 : 10));

  // Secondary meta subtitles (MW load / voltage class)
  ctx.fillStyle = isSelected ? '#7dd3fc' : '#94a3b8';
  ctx.font = `${Math.floor(Math.max(8, 8.5 * proj.scale))}px "JetBrains Mono", monospace`;
  
  const labelText = `${node.load} / ${node.capacity} [${node.voltage.split(' ')[0]}]`;
  ctx.fillText(labelText, proj.x, proj.y + radius + 15);

  // Status tiny pill indicator
  if (node.status === 'critical' || node.status === 'warning') {
    const pX = proj.x;
    const pY = proj.y - radius - (isSelected ? 32 : 24);
    ctx.fillStyle = node.status === 'critical' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(245, 158, 11, 0.95)';
    ctx.font = 'bold 7px "JetBrains Mono", monospace';
    
    const warnWord = `⚠️ ${node.status.toUpperCase()}`;
    const txtW = ctx.measureText(warnWord).width;
    
    // Draw micro rounded rectangular backdrop
    ctx.fillRect(pX - txtW / 2 - 4, pY - 6, txtW + 8, 9);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(warnWord, pX, pY + 1);
  }
  ctx.restore();
}
