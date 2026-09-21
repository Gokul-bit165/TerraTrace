/* ==========================================================================
   ORBIT — Temporal Change Studio Logic
   Frontend prototype only. No backend, no external APIs, no real ML.
   ========================================================================== */

import { CHANGE_SITES, DEFAULT_CHANGE_SITE_ID } from './change-data.js';
import { showToast } from './ui-feedback.js';

const STATE_LABELS = {
  baseline: 'BASELINE',
  'early-signal': 'EARLY SIGNAL',
  emerging: 'EMERGING',
  supported: 'SUPPORTED',
  confirmed: 'CONFIRMED',
};

const TYPE_DISPLAY = {
  construction: 'Construction',
  road: 'Road development',
  facility: 'Facility expansion',
};

const FOOTPRINT_STAGES = {
  faint: { scale: 0.35, opacity: 0.4, dashed: true, color: 'var(--color-detection)' },
  small: { scale: 0.55, opacity: 0.55, dashed: true, color: 'var(--color-detection)' },
  initial: { scale: 0.75, opacity: 0.8, dashed: false, color: 'var(--color-detection)' },
  confirmed: { scale: 0.95, opacity: 0.9, dashed: false, color: 'var(--color-positive)' },
  expanded: { scale: 1.15, opacity: 0.95, dashed: false, color: 'var(--color-positive)' },
};

const cstate = {
  site: null,
  dateIndex: 0,
  mode: 'timeline',
  sensorMode: 'optical',
  isPlaying: false,
  playTimer: null,
  analystStatus: null,
};

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */

function formatDateLong(dateStr) {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')} ${months[m - 1]} ${y}`;
}

function sensorDisplayLabel(dateEntry) {
  if (cstate.sensorMode === 'sar') return 'Sentinel-1 · SAR';
  if (cstate.sensorMode === 'combined') return 'Sentinel-2 + Sentinel-1';
  return dateEntry.sensor;
}

function sceneIdForSensor(dateEntry) {
  if (cstate.sensorMode === 'sar') {
    return dateEntry.sceneId.replace(/^S2([AB])/, 'S1$1').replace('MSIL2A', 'IW_GRDH');
  }
  if (cstate.sensorMode === 'combined') return `${dateEntry.sceneId} + SAR`;
  return dateEntry.sceneId;
}

/* ---------------------------------------------------------------------- */
/* Scene composition (SVG-generated evidence imagery)                       */
/* ---------------------------------------------------------------------- */

function sceneDefs(sensorMode) {
  const showSpeckle = sensorMode === 'sar' || sensorMode === 'combined';
  const terrain1 = sensorMode === 'sar' ? '#C7CDC5' : '#E4E9DF';
  const terrain2 = sensorMode === 'sar' ? '#AEB6AA' : '#D2DACB';
  return `
    <defs>
      <linearGradient id="scene-terrain" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${terrain1}" />
        <stop offset="100%" stop-color="${terrain2}" />
      </linearGradient>
      <pattern id="scene-speckle" width="6" height="6" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.6" fill="#00000022" />
        <circle cx="4" cy="3" r="0.5" fill="#00000018" />
      </pattern>
    </defs>
    <rect width="800" height="500" fill="url(#scene-terrain)" />
    ${showSpeckle ? '<rect width="800" height="500" fill="url(#scene-speckle)" />' : ''}
  `;
}

function vegetationPatches() {
  const patches = [
    { x: 110, y: 80, rx: 60, ry: 34 },
    { x: 640, y: 90, rx: 70, ry: 40 },
    { x: 700, y: 420, rx: 60, ry: 32 },
    { x: 130, y: 440, rx: 55, ry: 30 },
  ];
  return patches.map((p) => `<ellipse cx="${p.x}" cy="${p.y}" rx="${p.rx}" ry="${p.ry}" fill="#B7C2A6" opacity="0.5" />`).join('');
}

function sceneDecorations(kind) {
  if (kind === 'river') {
    return '<path d="M 850 -20 C 650 140, 560 260, 460 420 C 380 540, 260 560, 60 640" stroke="#7FA8C9" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.85" />';
  }
  if (kind === 'road') {
    return `
      <path d="M -20 300 L 820 260" stroke="#B7BEB3" stroke-width="6" fill="none" stroke-linecap="round" />
      <path d="M 300 -20 L 500 620" stroke="#B7BEB3" stroke-width="5" fill="none" stroke-linecap="round" />
    `;
  }
  if (kind === 'facility') {
    return '<rect x="300" y="150" width="150" height="100" rx="6" fill="#C7CEC8" stroke="#9AA39C" stroke-width="2" />';
  }
  return '';
}

function cloudOverlay(cloud) {
  if (cloud < 15) return '';
  const blobs = [{ x: 200, y: 120, rx: 90, ry: 40 }, { x: 600, y: 400, rx: 100, ry: 46 }, { x: 150, y: 420, rx: 70, ry: 34 }];
  const opacity = Math.min(0.5, cloud / 40).toFixed(2);
  return blobs.map((b) => `<ellipse cx="${b.x}" cy="${b.y}" rx="${b.rx}" ry="${b.ry}" fill="#FFFFFF" opacity="${opacity}" />`).join('');
}

function centerMarker(center) {
  return `
    <circle cx="${center.x}" cy="${center.y}" r="4" fill="none" stroke="var(--color-text-primary)" stroke-width="1.5" opacity="0.6" />
    <line x1="${center.x - 10}" y1="${center.y}" x2="${center.x + 10}" y2="${center.y}" stroke="var(--color-text-primary)" stroke-width="1" opacity="0.4" />
    <line x1="${center.x}" y1="${center.y - 10}" x2="${center.x}" y2="${center.y + 10}" stroke="var(--color-text-primary)" stroke-width="1" opacity="0.4" />
  `;
}

function aoiBoundary() {
  return '<rect x="30" y="24" width="740" height="452" rx="16" fill="none" stroke="var(--color-text-secondary)" stroke-width="1.5" stroke-dasharray="6 5" opacity="0.5" />';
}

function footprintPolygonPoints(center, size) {
  const offsets = [[-1, -0.6], [0.9, -0.9], [1.15, 0.45], [0.35, 1.05], [-0.85, 0.75], [-1.1, 0.1]];
  return offsets.map(([ox, oy]) => `${(center.x + ox * size).toFixed(1)},${(center.y + oy * size).toFixed(1)}`).join(' ');
}

function buildFootprintSvg(site, dateEntry) {
  const stage = FOOTPRINT_STAGES[dateEntry.footprint];
  if (!stage) return '';
  const size = site.footprintBaseSize * stage.scale;
  const points = footprintPolygonPoints(site.footprintCenter, size);
  const dash = stage.dashed ? 'stroke-dasharray="5 4"' : '';
  return `<polygon points="${points}" fill="${stage.color}" fill-opacity="${(stage.opacity * 0.35).toFixed(2)}" stroke="${stage.color}" stroke-width="2" ${dash} opacity="${stage.opacity}" />`;
}

function buildEvidenceSvg(site, dateEntry) {
  return `
    ${sceneDefs(cstate.sensorMode)}
    ${vegetationPatches()}
    ${sceneDecorations(site.sceneKind)}
    ${buildFootprintSvg(site, dateEntry)}
    ${cloudOverlay(dateEntry.cloud)}
    ${centerMarker(site.footprintCenter)}
    ${aoiBoundary()}
  `;
}

function buildChangeMapSvg(site) {
  const baseline = footprintPolygonPoints(site.footprintCenter, site.footprintBaseSize * 1.3);
  const early = footprintPolygonPoints(site.footprintCenter, site.footprintBaseSize * 0.65);
  const confirmed = footprintPolygonPoints(site.footprintCenter, site.footprintBaseSize * 0.95);
  return `
    ${sceneDefs('optical')}
    ${vegetationPatches()}
    ${sceneDecorations(site.sceneKind)}
    <polygon points="${baseline}" fill="var(--color-text-tertiary)" fill-opacity="0.18" stroke="var(--color-text-tertiary)" stroke-width="1.5" stroke-dasharray="4 3" />
    <polygon points="${confirmed}" fill="var(--color-positive)" fill-opacity="0.28" stroke="var(--color-positive)" stroke-width="2" />
    <polygon points="${early}" fill="var(--color-detection)" fill-opacity="0.35" stroke="var(--color-detection)" stroke-width="2" />
    ${centerMarker(site.footprintCenter)}
    ${aoiBoundary()}
  `;
}

/* ---------------------------------------------------------------------- */
/* Rendering                                                                */
/* ---------------------------------------------------------------------- */

function renderHeader() {
  const site = cstate.site;
  document.getElementById('change-breadcrumb').textContent = `DISCOVERY / SITE ${site.displayId} / CHANGE STUDIO`;
  document.getElementById('change-site-id').textContent = site.displayId;
  document.getElementById('change-site-type').textContent = site.typeLabel;
  document.getElementById('change-site-coords').textContent = `${site.lat.toFixed(4)}° N, ${site.lon.toFixed(4)}° E`;
  document.getElementById('change-semantic-value').textContent = `${Math.round(site.semanticMatch * 100)}%`;
  document.getElementById('change-confidence-value').textContent = `${Math.round(site.changeConfidence * 100)}%`;
  updateAnalystStatusDisplay();
}

function updateAnalystStatusDisplay() {
  const badge = document.getElementById('change-status-badge');
  const line = document.getElementById('analyst-status-line');
  if (!badge) return;

  if (cstate.analystStatus === 'confirmed') {
    badge.textContent = 'ANALYST CONFIRMED';
    badge.className = 'change-status-badge';
  } else if (cstate.analystStatus === 'uncertain') {
    badge.textContent = 'ANALYST MARKED UNCERTAIN';
    badge.className = 'change-status-badge is-uncertain';
  } else if (cstate.analystStatus === 'rejected') {
    badge.textContent = 'ANALYST REJECTED';
    badge.className = 'change-status-badge is-rejected';
  } else {
    badge.textContent = cstate.site.status;
    badge.className = 'change-status-badge';
  }

  if (line) {
    line.textContent = cstate.analystStatus
      ? `Recorded: ${badge.textContent.toLowerCase()}`
      : 'No analyst decision recorded yet.';
  }
}

function updateAcquisitionCard(dateEntry) {
  document.getElementById('acq-date').textContent = dateEntry.label;
  document.getElementById('acq-sensor').textContent = sensorDisplayLabel(dateEntry);
  document.getElementById('acq-cloud').textContent = `${dateEntry.cloud}%`;
  document.getElementById('acq-valid').textContent = `${dateEntry.validPixels}%`;
  document.getElementById('acq-scene').textContent = sceneIdForSensor(dateEntry);
}

function updateStateBadge(dateEntry) {
  const badge = document.getElementById('change-state-badge');
  badge.className = `change-state-badge state-${dateEntry.state}`;
  badge.textContent = STATE_LABELS[dateEntry.state];
}

function renderEvidenceCanvas() {
  const site = cstate.site;
  const svg = document.getElementById('evidence-svg');
  const compareWrap = document.getElementById('compare-wrap');
  const legend = document.getElementById('change-map-legend');
  const stateBadge = document.getElementById('change-state-badge');
  const acqCard = document.getElementById('acquisition-card');

  svg.hidden = cstate.mode === 'compare';
  compareWrap.hidden = cstate.mode !== 'compare';
  legend.hidden = cstate.mode !== 'changemap';
  stateBadge.hidden = cstate.mode !== 'timeline';
  acqCard.hidden = cstate.mode !== 'timeline';

  if (cstate.mode === 'timeline') {
    const dateEntry = site.dates[cstate.dateIndex];
    svg.innerHTML = buildEvidenceSvg(site, dateEntry);
    updateAcquisitionCard(dateEntry);
    updateStateBadge(dateEntry);
  } else if (cstate.mode === 'changemap') {
    svg.innerHTML = buildChangeMapSvg(site);
  } else if (cstate.mode === 'compare') {
    const beforeEntry = site.dates[3];
    const afterEntry = site.dates[site.dates.length - 1];
    document.querySelector('#compare-before svg').innerHTML = buildEvidenceSvg(site, beforeEntry);
    document.querySelector('#compare-after svg').innerHTML = buildEvidenceSvg(site, afterEntry);
    document.getElementById('compare-label-before').textContent = `${beforeEntry.label} · BASELINE`;
    document.getElementById('compare-label-after').textContent = `${afterEntry.label} · CURRENT`;
  }

  document.getElementById('evidence-coords').textContent = `${site.lat.toFixed(4)}° N, ${site.lon.toFixed(4)}° E`;
}

function renderTimelineTicks() {
  const site = cstate.site;
  const container = document.getElementById('timeline-ticks');
  container.innerHTML = site.dates.map((d, idx) => {
    const classes = ['timeline-tick'];
    if (idx < cstate.dateIndex) classes.push('is-past');
    if (idx === cstate.dateIndex) classes.push('is-current');
    if (idx === site.earliestSupportedIndex) classes.push('is-change-event');
    return `<button type="button" class="${classes.join(' ')}" data-idx="${idx}" aria-label="${d.label}"><span class="timeline-tick-dot"></span><span class="timeline-tick-label">${d.label}</span></button>`;
  }).join('');

  const earliest = site.dates[site.earliestSupportedIndex];
  const callout = document.getElementById('change-event-callout');
  if (callout) callout.textContent = `CHANGE · ${formatDateLong(earliest.date)}`;
}

function renderConfidenceGraph() {
  const site = cstate.site;
  const svg = document.getElementById('confidence-graph-svg');
  const w = 560;
  const h = 140;
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 22;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const n = site.dates.length;

  const xFor = (i) => padL + (i / (n - 1)) * innerW;
  const yFor = (conf) => padT + (1 - conf) * innerH;

  const points = site.dates.map((d, i) => ({ x: xFor(i), y: yFor(d.confidence) }));
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(padT + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(padT + innerH).toFixed(1)} Z`;

  const earliestIdx = site.earliestSupportedIndex;
  const guideX = points[earliestIdx].x.toFixed(1);

  const circles = points.map((p, i) => {
    let cls = 'confidence-point';
    if (i === earliestIdx) cls += ' is-earliest';
    if (i === cstate.dateIndex) cls += ' is-current';
    return `<circle class="${cls}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" />`;
  }).join('');

  const labels = site.dates.map((d, i) => {
    const short = `${d.label.slice(0, 3)}${d.label.slice(-2)}`;
    return `<text class="confidence-axis-label" x="${xFor(i).toFixed(1)}" y="${h - 6}" text-anchor="middle">${short}</text>`;
  }).join('');

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = `
    <path class="confidence-area" d="${areaPath}" />
    <path class="confidence-line" d="${linePath}" />
    <line class="confidence-guide" x1="${guideX}" y1="${padT}" x2="${guideX}" y2="${(padT + innerH).toFixed(1)}" />
    ${circles}
    ${labels}
  `;
}

function renderEarliestPanel() {
  const site = cstate.site;
  const entry = site.dates[site.earliestSupportedIndex];
  document.getElementById('earliest-date').textContent = formatDateLong(entry.date);
  document.getElementById('earliest-interval').textContent = `± ${site.earliestSupportedUncertaintyDays} DAYS`;
}

function renderEvidencePanel() {
  const site = cstate.site;
  document.getElementById('evidence-signals').innerHTML = site.supportingSignals
    .map((s) => `<li><span class="mark is-positive">✓</span>${s}</li>`).join('');
  document.getElementById('evidence-confounders').innerHTML = site.confounders
    .map((cf) => `<li><span class="mark ${cf.cleared ? 'is-positive' : 'is-flagged'}">${cf.cleared ? '✓' : '⚠'}</span>${cf.label}</li>`).join('');
  document.getElementById('evidence-confidence-value').textContent = `${Math.round(site.changeConfidence * 100)}%`;
}

function renderMetrics() {
  const site = cstate.site;
  document.getElementById('metric-change-type').textContent = TYPE_DISPLAY[site.type];
  document.getElementById('metric-area').textContent = `${site.affectedArea.toLocaleString()} m²`;
  document.getElementById('metric-earliest').textContent = formatDateLong(site.dates[site.earliestSupportedIndex].date);
  document.getElementById('metric-observations').textContent = String(site.observationsCount);
  document.getElementById('metric-sensors').textContent = site.sensors.join(', ');
  document.getElementById('metric-persistence').textContent = `${site.persistenceObservations} consecutive observations`;
}

function renderQualityStrip() {
  const entry = cstate.site.dates[cstate.dateIndex];
  const quality = cstate.site.quality;
  document.getElementById('quality-cloud').textContent = `${entry.cloud}%`;
  document.getElementById('quality-valid').textContent = `${entry.validPixels}%`;
  document.getElementById('quality-registration').textContent = quality.registration;
  document.getElementById('quality-seasonality').textContent = quality.seasonality;
  document.getElementById('quality-radiometric').textContent = quality.radiometric;
}

function renderWhyReasoning() {
  document.getElementById('why-steps').innerHTML = cstate.site.whyReasoning.map((step, i) => `
    <div class="why-step">
      <span class="why-step-index">${String(i + 1).padStart(2, '0')}</span>
      <div>
        <p class="why-step-title">${step.title}</p>
        <p class="why-step-body">${step.body}</p>
      </div>
    </div>
  `).join('');
}

function renderProvenance() {
  const p = cstate.site.provenance;
  document.getElementById('prov-source').textContent = p.source;
  document.getElementById('prov-scenes').textContent = `${p.scenes} observations`;
  document.getElementById('prov-model').textContent = p.model;
  document.getElementById('prov-index').textContent = p.index;
  document.getElementById('prov-processing').innerHTML = p.processing.map((s) => `<li>${s}</li>`).join('');
}

function updateSensorNote() {
  const note = document.getElementById('sensor-note');
  if (!note) return;
  const map = {
    optical: '',
    sar: 'SAR signal helps distinguish structural persistence from optical illumination or cloud effects.',
    combined: 'Combined view aligns optical and SAR evidence for a single assessment.',
  };
  const text = map[cstate.sensorMode];
  note.hidden = !text;
  note.textContent = text;
}

/* ---------------------------------------------------------------------- */
/* Date selection + playback                                               */
/* ---------------------------------------------------------------------- */

function setDateIndex(idx, opts = {}) {
  cstate.dateIndex = idx;
  const slider = document.getElementById('timeline-slider');
  if (slider && !opts.fromSlider) slider.value = String(idx);
  renderTimelineTicks();
  renderEvidenceCanvas();
  renderConfidenceGraph();
  renderQualityStrip();
}

function pausePlayback() {
  if (cstate.playTimer) window.clearInterval(cstate.playTimer);
  cstate.playTimer = null;
  cstate.isPlaying = false;
}

function startPlayback() {
  if (cstate.isPlaying) return;
  const n = cstate.site.dates.length;
  if (cstate.dateIndex >= n - 1) setDateIndex(0);
  cstate.isPlaying = true;
  cstate.playTimer = window.setInterval(() => {
    const next = cstate.dateIndex + 1;
    if (next >= n) {
      pausePlayback();
      return;
    }
    setDateIndex(next);
  }, 650);
}

function resetPlayback() {
  pausePlayback();
  setDateIndex(0);
}

/* ---------------------------------------------------------------------- */
/* Compare divider drag                                                    */
/* ---------------------------------------------------------------------- */

function initCompareDivider() {
  const wrap = document.getElementById('compare-wrap');
  const afterLayer = document.getElementById('compare-after');
  const divider = document.getElementById('compare-divider');
  if (!wrap || !afterLayer || !divider) return;

  let dragging = false;

  function setPct(pct) {
    const clamped = Math.min(95, Math.max(5, pct));
    afterLayer.style.clipPath = `inset(0 0 0 ${clamped}%)`;
    divider.style.left = `${clamped}%`;
  }

  function handleMove(clientX) {
    const rect = wrap.getBoundingClientRect();
    setPct(((clientX - rect.left) / rect.width) * 100);
  }

  wrap.addEventListener('pointerdown', (e) => {
    if (cstate.mode !== 'compare') return;
    dragging = true;
    handleMove(e.clientX);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    handleMove(e.clientX);
  });
  window.addEventListener('pointerup', () => { dragging = false; });
}

/* ---------------------------------------------------------------------- */
/* Controls                                                                 */
/* ---------------------------------------------------------------------- */

function resetModeTabsUI() {
  document.querySelectorAll('.evidence-mode-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.mode === 'timeline'));
}

function resetSensorTabsUI() {
  document.querySelectorAll('.sensor-mode-btn').forEach((b) => b.classList.toggle('is-active', b.dataset.sensor === 'optical'));
}

function initModeTabs() {
  document.querySelectorAll('.evidence-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.evidence-mode-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      cstate.mode = btn.dataset.mode;
      renderEvidenceCanvas();
    });
  });
}

function initSensorTabs() {
  document.querySelectorAll('.sensor-mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sensor-mode-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      cstate.sensorMode = btn.dataset.sensor;
      renderEvidenceCanvas();
      updateSensorNote();
    });
  });
}

function initTimelineControls() {
  const slider = document.getElementById('timeline-slider');
  slider?.addEventListener('input', () => setDateIndex(Number(slider.value), { fromSlider: true }));

  document.getElementById('timeline-ticks')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.timeline-tick');
    if (btn) setDateIndex(Number(btn.dataset.idx));
  });
}

function initPlayback() {
  document.getElementById('btn-play')?.addEventListener('click', startPlayback);
  document.getElementById('btn-pause')?.addEventListener('click', pausePlayback);
  document.getElementById('btn-reset')?.addEventListener('click', resetPlayback);
}

function initCollapsibles() {
  document.querySelectorAll('.collapsible-header').forEach((header) => {
    header.addEventListener('click', () => {
      header.closest('.collapsible-section').classList.toggle('is-expanded');
    });
  });
}

function initAnalystControls() {
  document.getElementById('btn-confirm-change')?.addEventListener('click', () => {
    cstate.analystStatus = 'confirmed';
    updateAnalystStatusDisplay();
    showToast('Change confirmed', `${cstate.site.displayId} recorded as analyst confirmed.`);
  });
  document.getElementById('btn-mark-uncertain')?.addEventListener('click', () => {
    cstate.analystStatus = 'uncertain';
    updateAnalystStatusDisplay();
    showToast('Marked uncertain', `${cstate.site.displayId} flagged for further review.`);
  });
  document.getElementById('btn-reject-change')?.addEventListener('click', () => {
    cstate.analystStatus = 'rejected';
    updateAnalystStatusDisplay();
    showToast('Change rejected', `${cstate.site.displayId} recorded as analyst rejected.`);
  });
}

/* ---------------------------------------------------------------------- */
/* Public API                                                               */
/* ---------------------------------------------------------------------- */

export function initChangeStudio() {
  initModeTabs();
  initSensorTabs();
  initTimelineControls();
  initPlayback();
  initCompareDivider();
  initCollapsibles();
  initAnalystControls();
}

export function enterChangeStudio(siteId) {
  pausePlayback();

  const site = CHANGE_SITES[siteId] || CHANGE_SITES[DEFAULT_CHANGE_SITE_ID];
  cstate.site = site;
  cstate.mode = 'timeline';
  cstate.sensorMode = 'optical';
  cstate.analystStatus = null;
  cstate.dateIndex = site.earliestSupportedIndex;

  resetModeTabsUI();
  resetSensorTabsUI();

  const slider = document.getElementById('timeline-slider');
  if (slider) {
    slider.max = String(site.dates.length - 1);
    slider.value = String(cstate.dateIndex);
  }

  renderHeader();
  renderTimelineTicks();
  renderEvidenceCanvas();
  renderConfidenceGraph();
  renderEarliestPanel();
  renderEvidencePanel();
  renderMetrics();
  renderQualityStrip();
  renderWhyReasoning();
  renderProvenance();
  updateSensorNote();
}
