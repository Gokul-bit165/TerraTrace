/* ==========================================================================
   ORBIT — Discovery Workspace Logic
   Frontend prototype only. No backend, no external APIs, no real ML.
   ========================================================================== */

import { CANDIDATES, MAP_BOUNDS, SEARCH_INTENT, CLUSTERS, BASE_METRICS, RETRIEVAL_STEPS } from './discovery-data.js';
import { showToast } from './ui-feedback.js';

const TYPE_LABEL = {
  construction: 'NEW CONSTRUCTION',
  road: 'ROAD DEVELOPMENT',
  clearance: 'LAND CLEARANCE',
  water: 'WATER CHANGE',
};

const TYPE_DISPLAY = {
  construction: 'Construction',
  road: 'Road development',
  clearance: 'Land clearance',
  water: 'Water change',
};

const WHY_TARGET = {
  construction: 'Structure',
  road: 'Linear feature',
  clearance: 'Vegetation loss',
  water: 'Water extent',
};

const dstate = {
  filters: {
    years: new Set(['2024', '2025', '2026']),
    sensors: new Set(['Sentinel-2', 'Sentinel-1']),
    types: new Set(['construction']),
    nearRiverOnly: true,
    cloudMax: 20,
    minConfidence: 70,
  },
  sortBy: 'relevance',
  viewMode: 'list',
  searchMode: 'text',
  activeLayer: 'optical',
  selectedId: null,
  baseCandidateCount: BASE_METRICS.candidates,
  entered: false,
};

/* ---------------------------------------------------------------------- */
/* Helpers                                                                  */
/* ---------------------------------------------------------------------- */

function project(lat, lon) {
  const x = ((lon - MAP_BOUNDS.lonMin) / (MAP_BOUNDS.lonMax - MAP_BOUNDS.lonMin)) * 800;
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * 600;
  return { x, y };
}

function formatMonthYear(dateStr) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [y, m] = dateStr.split('-');
  return `${months[Number(m) - 1]} ${y}`;
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/* ---------------------------------------------------------------------- */
/* Filtering / sorting                                                     */
/* ---------------------------------------------------------------------- */

function getFilteredCandidates() {
  const f = dstate.filters;
  return CANDIDATES.filter((c) => {
    const year = c.acquisitionDate.slice(0, 4);
    if (!f.years.has(year)) return false;
    if (!f.sensors.has(c.sensor)) return false;
    if (!f.types.has(c.type)) return false;
    if (f.nearRiverOnly && c.distanceToRiver > 1000) return false;
    if (c.cloudCoverage > f.cloudMax) return false;
    if (Math.round(c.semanticScore * 100) < f.minConfidence) return false;
    return true;
  });
}

function sortCandidates(list) {
  const arr = [...list];
  if (dstate.sortBy === 'confidence') arr.sort((a, b) => b.changeConfidence - a.changeConfidence);
  else if (dstate.sortBy === 'recency') arr.sort((a, b) => new Date(b.acquisitionDate) - new Date(a.acquisitionDate));
  else if (dstate.sortBy === 'distance') arr.sort((a, b) => a.distanceToRiver - b.distanceToRiver);
  else arr.sort((a, b) => b.semanticScore - a.semanticScore);
  return arr;
}

/* ---------------------------------------------------------------------- */
/* Metrics                                                                  */
/* ---------------------------------------------------------------------- */

function flashMetric(el) {
  el.classList.add('is-updating');
  window.setTimeout(() => el.classList.remove('is-updating'), 400);
}

function updateMetrics(filteredList) {
  const ratio = CANDIDATES.length ? filteredList.length / CANDIDATES.length : 0;
  const candidates = Math.max(filteredList.length, Math.round(dstate.baseCandidateCount * ratio));
  const highConfidence = Math.min(candidates, Math.round(BASE_METRICS.highConfidence * ratio));
  const priority = Math.min(highConfidence, Math.round(BASE_METRICS.priority * ratio));

  const map = {
    'metric-candidates': candidates,
    'metric-high-confidence': highConfidence,
    'metric-priority': priority,
  };

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.textContent !== String(value)) flashMetric(el);
    el.textContent = String(value);
  });
}

/* ---------------------------------------------------------------------- */
/* Map                                                                      */
/* ---------------------------------------------------------------------- */

function vegetationPatches() {
  const patches = [
    { x: 120, y: 90, rx: 70, ry: 40 },
    { x: 660, y: 120, rx: 90, ry: 50 },
    { x: 200, y: 480, rx: 80, ry: 45 },
    { x: 600, y: 500, rx: 70, ry: 38 },
    { x: 400, y: 70, rx: 60, ry: 30 },
  ];
  return patches.map((p) => `<ellipse class="map-vegetation" cx="${p.x}" cy="${p.y}" rx="${p.rx}" ry="${p.ry}" fill="#B7C2A6" />`).join('');
}

function buildMapSvg() {
  const svg = document.getElementById('map-svg');
  if (!svg) return;

  const waterPoints = CANDIDATES.filter((c) => c.type === 'water')
    .map((c) => project(c.lat, c.lon))
    .sort((a, b) => a.x - b.x);

  const anchoredPoints = [
    { x: -40, y: waterPoints[0] ? waterPoints[0].y : 300 },
    ...waterPoints,
    { x: 840, y: waterPoints.length ? waterPoints[waterPoints.length - 1].y : 300 },
  ];
  const riverPath = anchoredPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const changeCircles = CANDIDATES.filter((c) => c.tier !== 'low').map((c) => {
    const { x, y } = project(c.lat, c.lon);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(18 + c.aoiArea * 3).toFixed(1)}" fill="var(--color-detection)" opacity="0.16" />`;
  }).join('');

  svg.innerHTML = `
    <defs>
      <linearGradient id="terrain-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#E4E9DF" />
        <stop offset="100%" stop-color="#D2DACB" />
      </linearGradient>
    </defs>
    <rect class="map-terrain" x="0" y="0" width="800" height="600" fill="url(#terrain-grad)" />
    ${vegetationPatches()}
    <path class="map-road" d="M 0 130 L 800 175" />
    <path class="map-road" d="M 70 600 L 430 30" />
    <path class="map-river" d="${riverPath}" />
    <rect class="map-aoi" x="36" y="30" width="728" height="540" rx="18" />
    <g class="map-change-overlay">${changeCircles}</g>
  `;
}

function renderMap(filteredIds) {
  const container = document.getElementById('map-markers');
  if (!container) return;

  container.innerHTML = CANDIDATES.map((c) => {
    const { x, y } = project(c.lat, c.lon);
    const leftPct = ((x / 800) * 100).toFixed(2);
    const topPct = ((y / 600) * 100).toFixed(2);
    const filteredOut = !filteredIds.has(c.id);
    const selected = c.id === dstate.selectedId;
    const classes = ['map-marker', `tier-${c.tier}`];
    if (filteredOut) classes.push('is-filtered-out');
    if (selected) classes.push('is-selected');
    return `<button type="button" class="${classes.join(' ')}" style="left:${leftPct}%; top:${topPct}%;" data-id="${c.id}" aria-label="${c.id}, ${c.type}, semantic match ${Math.round(c.semanticScore * 100)} percent" aria-pressed="${selected}"></button>`;
  }).join('');
}

function focusMapOn(candidate) {
  const { x, y } = project(candidate.lat, candidate.lon);
  const originX = ((x / 800) * 100).toFixed(2);
  const originY = ((y / 600) * 100).toFixed(2);
  const scaleLayer = document.getElementById('map-scale-layer');
  if (scaleLayer) {
    scaleLayer.style.transformOrigin = `${originX}% ${originY}%`;
    scaleLayer.style.transform = 'scale(1.3)';
  }
  const coordsEl = document.getElementById('map-coords');
  if (coordsEl) coordsEl.textContent = `${candidate.lat.toFixed(4)}° N, ${candidate.lon.toFixed(4)}° E`;
}

/* ---------------------------------------------------------------------- */
/* Results list                                                             */
/* ---------------------------------------------------------------------- */

function resultCardTemplate(c, rank) {
  const shortId = c.id.split('-')[1];
  return `
    <article class="result-card ${c.id === dstate.selectedId ? 'is-selected' : ''}" data-id="${c.id}" tabindex="0" role="button" aria-pressed="${c.id === dstate.selectedId}">
      <div class="result-card-top">
        <span class="result-thumb result-thumb--${c.type}" aria-hidden="true"></span>
        <div class="result-card-head">
          <span class="result-id">#${shortId}</span>
          <span class="result-type-badge tier-${c.tier}">${TYPE_LABEL[c.type]}</span>
        </div>
        <span class="result-rank">${String(rank).padStart(2, '0')}</span>
      </div>
      <div class="result-card-scores">
        <span>${Math.round(c.semanticScore * 100)}% semantic match</span>
      </div>
      <div class="result-card-meta">
        <span>Change confidence ${Math.round(c.changeConfidence * 100)}%</span>
        <span>${formatMonthYear(c.acquisitionDate)}</span>
      </div>
      <div class="result-card-meta">
        <span>${c.aoiArea} km² AOI</span>
        <span>${c.distanceToRiver} m from river</span>
      </div>
      <button class="btn-view-evidence" type="button" data-view-evidence="${c.id}">VIEW EVIDENCE →</button>
    </article>
  `;
}

function renderResultsList(list) {
  const container = document.getElementById('results-list');
  if (!container) return;
  if (!list.length) {
    container.innerHTML = '<p class="empty-results">No candidates match the current filters.</p>';
    return;
  }
  container.innerHTML = list.map((c, idx) => resultCardTemplate(c, idx + 1)).join('');
}

function renderClusters() {
  const container = document.getElementById('cluster-list');
  if (!container) return;

  container.innerHTML = CLUSTERS.map((cl) => {
    const members = CANDIDATES.filter((c) => c.cluster === cl.key);
    const avgConf = members.length
      ? Math.round((members.reduce((sum, c) => sum + c.changeConfidence, 0) / members.length) * 100)
      : 0;
    const miniCells = Array.from({ length: 9 }).map((_, i) => {
      const member = members[i % members.length];
      const tierClass = member ? (member.tier === 'high' ? 'is-high' : member.tier === 'medium' ? 'is-medium' : '') : '';
      return `<span class="${tierClass}"></span>`;
    }).join('');

    return `
      <div class="cluster-card">
        <div class="cluster-mini" aria-hidden="true">${miniCells}</div>
        <div class="cluster-info">
          <p class="cluster-name">${cl.name}</p>
          <p class="cluster-desc">${cl.description}</p>
          <div class="cluster-meta"><span>${members.length} sites</span><span>Avg confidence ${avgConf}%</span></div>
        </div>
      </div>
    `;
  }).join('');
}

/* ---------------------------------------------------------------------- */
/* Why this result panel                                                    */
/* ---------------------------------------------------------------------- */

function renderWhyPanel(candidate) {
  const content = document.getElementById('why-content');
  const empty = document.getElementById('why-empty');
  if (!candidate) {
    if (content) content.hidden = true;
    if (empty) empty.hidden = false;
    return;
  }
  if (content) content.hidden = false;
  if (empty) empty.hidden = true;

  const semanticPct = Math.round(candidate.semanticScore * 100);
  const changePct = Math.round(candidate.changeConfidence * 100);
  const isRecent = new Date(candidate.acquisitionDate) >= new Date('2025-06-01');

  document.getElementById('why-site-id').textContent = candidate.id;
  document.getElementById('why-coords-value').textContent = `${candidate.lat.toFixed(4)}° N · ${candidate.lon.toFixed(4)}° E`;

  document.getElementById('why-semantic-score').textContent = semanticPct;
  document.getElementById('why-semantic-bar').style.width = `${semanticPct}%`;
  document.getElementById('why-change-score').textContent = changePct;
  document.getElementById('why-change-bar').style.width = `${changePct}%`;

  document.getElementById('why-target').textContent = WHY_TARGET[candidate.type];
  document.getElementById('why-relation').textContent = candidate.distanceToRiver < 600 ? 'Near river' : 'Distant from river';
  document.getElementById('why-context').textContent = isRecent ? 'Recent development' : 'Longer-term pattern';

  document.getElementById('why-signals').innerHTML = candidate.supportingSignals
    .map((s) => `<li><span class="mark is-positive">✓</span>${s}</li>`).join('');
  document.getElementById('why-confounders').innerHTML = candidate.confounders
    .map((cf) => `<li><span class="mark ${cf.cleared ? 'is-positive' : 'is-flagged'}">${cf.cleared ? '✓' : '−'}</span>${cf.label}</li>`).join('');

  document.getElementById('why-footer-type').textContent = TYPE_DISPLAY[candidate.type];
  document.getElementById('why-footer-date').textContent = formatMonthYear(candidate.acquisitionDate);
}

/* ---------------------------------------------------------------------- */
/* Selection sync                                                           */
/* ---------------------------------------------------------------------- */

function selectCandidate(id, { scroll = true } = {}) {
  const candidate = CANDIDATES.find((c) => c.id === id);
  if (!candidate) return;

  dstate.selectedId = id;

  document.querySelectorAll('.map-marker').forEach((m) => {
    const isSelected = m.dataset.id === id;
    m.classList.toggle('is-selected', isSelected);
    m.setAttribute('aria-pressed', String(isSelected));
  });
  document.querySelectorAll('.result-card').forEach((card) => {
    const isSelected = card.dataset.id === id;
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-pressed', String(isSelected));
  });

  focusMapOn(candidate);
  renderWhyPanel(candidate);

  if (scroll) {
    document.querySelector(`.result-card[data-id="${id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/* ---------------------------------------------------------------------- */
/* Central refresh                                                          */
/* ---------------------------------------------------------------------- */

function refreshResults() {
  const filtered = getFilteredCandidates();
  const sorted = sortCandidates(filtered);
  const filteredIds = new Set(filtered.map((c) => c.id));

  renderMap(filteredIds);
  renderResultsList(sorted);
  updateMetrics(filtered);
  if (dstate.viewMode === 'cluster') renderClusters();

  if (!dstate.selectedId || !filteredIds.has(dstate.selectedId)) {
    if (sorted.length) selectCandidate(sorted[0].id, { scroll: false });
    else renderWhyPanel(null);
  } else {
    selectCandidate(dstate.selectedId, { scroll: false });
  }
}

/* ---------------------------------------------------------------------- */
/* Filter controls                                                          */
/* ---------------------------------------------------------------------- */

function syncFilterControls() {
  document.querySelectorAll('[data-year]').forEach((btn) => {
    btn.classList.toggle('is-active', dstate.filters.years.has(btn.dataset.year));
  });
  document.querySelectorAll('[data-sensor]').forEach((cb) => {
    cb.checked = dstate.filters.sensors.has(cb.value);
  });
  document.querySelectorAll('[data-type]').forEach((cb) => {
    cb.checked = dstate.filters.types.has(cb.value);
  });
  const riverCb = document.getElementById('filter-near-river');
  if (riverCb) riverCb.checked = dstate.filters.nearRiverOnly;
  document.querySelectorAll('[data-cloud]').forEach((btn) => {
    btn.classList.toggle('is-active', Number(btn.dataset.cloud) === dstate.filters.cloudMax);
  });
  const confSlider = document.getElementById('filter-confidence');
  const confReadout = document.getElementById('filter-confidence-value');
  if (confSlider) confSlider.value = dstate.filters.minConfidence;
  if (confReadout) confReadout.textContent = `${dstate.filters.minConfidence}%`;
}

function resetFilters() {
  dstate.filters = {
    years: new Set(['2024', '2025', '2026']),
    sensors: new Set(['Sentinel-2', 'Sentinel-1']),
    types: new Set(['construction']),
    nearRiverOnly: true,
    cloudMax: 20,
    minConfidence: 70,
  };
  syncFilterControls();
  refreshResults();
}

function initFilterControls() {
  document.querySelectorAll('[data-year]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const y = btn.dataset.year;
      if (dstate.filters.years.has(y)) dstate.filters.years.delete(y);
      else dstate.filters.years.add(y);
      btn.classList.toggle('is-active');
      refreshResults();
    });
  });

  document.querySelectorAll('[data-sensor]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) dstate.filters.sensors.add(cb.value);
      else dstate.filters.sensors.delete(cb.value);
      refreshResults();
    });
  });

  document.querySelectorAll('[data-type]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) dstate.filters.types.add(cb.value);
      else dstate.filters.types.delete(cb.value);
      refreshResults();
    });
  });

  document.getElementById('filter-near-river')?.addEventListener('change', (e) => {
    dstate.filters.nearRiverOnly = e.target.checked;
    refreshResults();
  });

  document.querySelectorAll('[data-cloud]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cloud]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dstate.filters.cloudMax = Number(btn.dataset.cloud);
      refreshResults();
    });
  });

  const confSlider = document.getElementById('filter-confidence');
  confSlider?.addEventListener('input', () => {
    dstate.filters.minConfidence = Number(confSlider.value);
    const readout = document.getElementById('filter-confidence-value');
    if (readout) readout.textContent = `${dstate.filters.minConfidence}%`;
    refreshResults();
  });

  document.getElementById('btn-reset-filters')?.addEventListener('click', resetFilters);

  syncFilterControls();
}

/* ---------------------------------------------------------------------- */
/* Sort / view / mode / layer toggles                                       */
/* ---------------------------------------------------------------------- */

function initSortControls() {
  document.querySelectorAll('.sort-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dstate.sortBy = btn.dataset.sort;
      refreshResults();
    });
  });
}

function initViewToggle() {
  document.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.view-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dstate.viewMode = btn.dataset.view;

      const list = document.getElementById('results-list');
      const clusters = document.getElementById('cluster-list');
      const sortRow = document.querySelector('.sort-row');

      if (dstate.viewMode === 'cluster') {
        if (list) list.hidden = true;
        if (clusters) clusters.hidden = false;
        if (sortRow) sortRow.hidden = true;
        renderClusters();
      } else {
        if (list) list.hidden = false;
        if (clusters) clusters.hidden = true;
        if (sortRow) sortRow.hidden = false;
      }
    });
  });
}

function initSearchModeToggle() {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dstate.searchMode = btn.dataset.mode;

      const textPanel = document.getElementById('text-search-filters');
      const imagePanel = document.getElementById('image-search-panel');
      if (textPanel) textPanel.hidden = dstate.searchMode !== 'text';
      if (imagePanel) imagePanel.hidden = dstate.searchMode !== 'image';
    });
  });

  document.getElementById('image-dropzone')?.addEventListener('click', () => {
    showToast('Local visual retrieval module ready', 'Reference-image search connects to the same retrieval pipeline in a later prototype phase.');
  });

  document.querySelectorAll('[data-similarity]').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-similarity]').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
    });
  });
}

function initLayerToggle() {
  document.querySelectorAll('.layer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.layer-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      dstate.activeLayer = btn.dataset.layer;
      const viewport = document.getElementById('map-viewport');
      if (viewport) viewport.dataset.layer = dstate.activeLayer;
    });
  });
}

function initResultInteractions() {
  document.getElementById('results-list')?.addEventListener('click', (e) => {
    const evidenceBtn = e.target.closest('[data-view-evidence]');
    if (evidenceBtn) {
      const id = evidenceBtn.dataset.viewEvidence;
      selectCandidate(id, { scroll: false });
      document.dispatchEvent(new CustomEvent('orbit:open-change-studio', { detail: { id } }));
      return;
    }
    const card = e.target.closest('.result-card');
    if (card) selectCandidate(card.dataset.id);
  });

  document.getElementById('results-list')?.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.result-card');
    if (card) {
      e.preventDefault();
      selectCandidate(card.dataset.id);
    }
  });

  document.getElementById('map-markers')?.addEventListener('click', (e) => {
    const marker = e.target.closest('.map-marker');
    if (marker && !marker.classList.contains('is-filtered-out')) selectCandidate(marker.dataset.id);
  });
}

/* ---------------------------------------------------------------------- */
/* Search intent strip                                                      */
/* ---------------------------------------------------------------------- */

function renderSearchIntent() {
  const map = {
    'intent-strip-target': SEARCH_INTENT.target,
    'intent-strip-relation': SEARCH_INTENT.relation,
    'intent-strip-temporal': SEARCH_INTENT.temporal,
    'intent-strip-persistence': SEARCH_INTENT.persistence,
  };
  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

/* ---------------------------------------------------------------------- */
/* Retrieval entry animation                                                */
/* ---------------------------------------------------------------------- */

function runRetrievalAnimation() {
  return new Promise((resolve) => {
    const loading = document.getElementById('retrieval-loading');
    const workspace = document.getElementById('discovery-workspace');
    const stepsContainer = document.getElementById('retrieval-steps');
    if (!loading || !workspace || !stepsContainer) {
      resolve();
      return;
    }

    stepsContainer.innerHTML = RETRIEVAL_STEPS.map((label, i) => `
      ${i > 0 ? '<span class="retrieval-step-arrow" aria-hidden="true">→</span>' : ''}
      <span class="retrieval-step" data-idx="${i}">${label}</span>
    `).join('');

    loading.hidden = false;
    workspace.hidden = true;
    workspace.classList.remove('is-visible');

    const stepEls = stepsContainer.querySelectorAll('.retrieval-step');
    let i = 0;

    function advance() {
      if (i > 0) {
        stepEls[i - 1].classList.remove('is-active');
        stepEls[i - 1].classList.add('is-done');
      }
      if (i < stepEls.length) {
        stepEls[i].classList.add('is-active');
        i += 1;
        window.setTimeout(advance, 210);
      } else {
        window.setTimeout(() => {
          loading.hidden = true;
          workspace.hidden = false;
          requestAnimationFrame(() => workspace.classList.add('is-visible'));
          resolve();
        }, 220);
      }
    }
    advance();
  });
}

/* ---------------------------------------------------------------------- */
/* Public API                                                               */
/* ---------------------------------------------------------------------- */

export function initDiscovery() {
  buildMapSvg();
  renderSearchIntent();
  initFilterControls();
  initSortControls();
  initViewToggle();
  initSearchModeToggle();
  initLayerToggle();
  initResultInteractions();
  refreshResults();

  const centerLat = ((MAP_BOUNDS.latMin + MAP_BOUNDS.latMax) / 2).toFixed(2);
  const centerLon = ((MAP_BOUNDS.lonMin + MAP_BOUNDS.lonMax) / 2).toFixed(2);
  const coordsEl = document.getElementById('map-coords');
  if (coordsEl) coordsEl.textContent = `${centerLat}° N, ${centerLon}° E`;
}

export async function enterDiscovery(query, intent) {
  const queryTextEl = document.getElementById('discovery-query-text');
  if (queryTextEl) queryTextEl.textContent = `"${query}"`;

  dstate.baseCandidateCount = (intent && intent.candidateCount) || BASE_METRICS.candidates;

  await runRetrievalAnimation();
  refreshResults();
  dstate.entered = true;
}
