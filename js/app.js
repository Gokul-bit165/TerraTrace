/* ==========================================================================
   ORBIT — Application Logic
   Frontend prototype only. No backend, no external APIs, no real AI.
   ========================================================================== */

import state from './state.js';
import { MISSION_PRESETS, STEPPER_STEPS, DEFAULT_INTENT, buildIntentForQuery } from './demo-data.js';
import { showToast, showModal, initModal } from './ui-feedback.js';
import { initDiscovery, enterDiscovery } from './discovery.js';
import { initChangeStudio, enterChangeStudio } from './change-studio.js';
import { DEFAULT_CHANGE_SITE_ID } from './change-data.js';

/* ---------------------------------------------------------------------- */
/* Clock                                                                   */
/* ---------------------------------------------------------------------- */

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const dateStr = `${pad(now.getDate())} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const dateEl = document.getElementById('clock-date');
  const timeEl = document.getElementById('clock-time');
  if (dateEl) dateEl.textContent = dateStr;
  if (timeEl) timeEl.textContent = timeStr;
}

/* ---------------------------------------------------------------------- */
/* Page navigation                                                          */
/* ---------------------------------------------------------------------- */

const PAGE_IDS = {
  mission: 'page-mission',
  discover: 'page-discovery',
  changes: 'page-changes',
};

const PAGE_CRUMBS = {
  mission: 'MISSION / COMMAND',
  discover: 'DISCOVERY / SEMANTIC SEARCH',
  changes: 'CHANGES / TEMPORAL STUDY',
};

let lastChangeSiteId = DEFAULT_CHANGE_SITE_ID;

function openChangeStudio(siteId) {
  lastChangeSiteId = siteId || lastChangeSiteId;
  document.querySelectorAll('.nav-item').forEach((el) => {
    el.classList.toggle('is-active', el.dataset.nav === 'changes');
  });
  showPage('changes');
  enterChangeStudio(lastChangeSiteId);
}

function showPage(pageName) {
  const targetId = PAGE_IDS[pageName] || PAGE_IDS.mission;
  document.querySelectorAll('.page').forEach((page) => {
    page.hidden = page.id !== targetId;
  });

  const crumb = document.getElementById('topbar-crumb');
  if (crumb) crumb.textContent = PAGE_CRUMBS[pageName] || PAGE_CRUMBS.mission;

  state.currentPage = pageName;
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const target = item.dataset.nav;

      if (target === 'mission') {
        navItems.forEach((el) => el.classList.remove('is-active'));
        item.classList.add('is-active');
        showPage('mission');
        return;
      }

      if (target === 'discover') {
        navItems.forEach((el) => el.classList.remove('is-active'));
        item.classList.add('is-active');
        showPage('discover');
        enterDiscovery(
          state.query || MISSION_PRESETS[0].query,
          state.intent || DEFAULT_INTENT
        );
        return;
      }

      if (target === 'changes') {
        openChangeStudio(lastChangeSiteId);
        return;
      }

      showToast(
        `${item.dataset.navLabel || 'Module'} not yet staged`,
        'This module is part of a later prototype stage and is not wired up yet.'
      );
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Mission presets                                                         */
/* ---------------------------------------------------------------------- */

function renderPresets() {
  const row = document.getElementById('preset-row');
  if (!row) return;

  MISSION_PRESETS.forEach((preset) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = preset.label;
    chip.addEventListener('click', () => {
      const input = document.getElementById('query-input');
      if (input) {
        input.value = preset.query;
        input.focus();
      }
      state.query = preset.query;
    });
    row.appendChild(chip);
  });
}

/* ---------------------------------------------------------------------- */
/* Reference options                                                       */
/* ---------------------------------------------------------------------- */

function initReferenceOptions() {
  const buttons = document.querySelectorAll('[data-reference-action]');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      showModal(
        'Reference-image retrieval module ready for integration.',
        'This capability is staged for a later prototype phase. The workstation shell and query pipeline are already prepared to receive it.'
      );
    });
  });
}

/* ---------------------------------------------------------------------- */
/* Stepper (semantic interpretation)                                       */
/* ---------------------------------------------------------------------- */

function renderStepper() {
  const stepper = document.getElementById('stepper');
  if (!stepper) return;

  stepper.innerHTML = STEPPER_STEPS.map((step) => `
    <div class="stepper-step" data-step="${step.key}">
      <span class="stepper-marker">
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1.5 5L4 7.5L8.5 2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </span>
      <span class="stepper-label">${step.label}</span>
    </div>
  `).join('');
}

function runStepperAnimation() {
  return new Promise((resolve) => {
    const steps = document.querySelectorAll('.stepper-step');
    let i = 0;

    function advance() {
      if (i > 0) {
        steps[i - 1].classList.remove('is-active');
        steps[i - 1].classList.add('is-done');
      }
      if (i < steps.length) {
        steps[i].classList.add('is-active');
        i += 1;
        window.setTimeout(advance, 260);
      } else {
        resolve();
      }
    }
    advance();
  });
}

function resetStepper() {
  document.querySelectorAll('.stepper-step').forEach((el) => {
    el.classList.remove('is-active', 'is-done');
  });
}

/* ---------------------------------------------------------------------- */
/* Intent cards + semantic statement                                       */
/* ---------------------------------------------------------------------- */

function renderIntentCards(intent) {
  const grid = document.getElementById('intent-grid');
  const statementText = document.getElementById('statement-text');
  if (!grid || !statementText) return;

  grid.innerHTML = intent.cards.map((card) => `
    <div class="intent-card">
      <p class="intent-card-label">${card.label}</p>
      <p class="intent-card-value">${card.value}</p>
      <p class="intent-card-meta">${card.meta}</p>
    </div>
  `).join('');

  statementText.textContent = `"${intent.statement}"`;
}

function revealIntentSection() {
  return new Promise((resolve) => {
    const section = document.getElementById('intent-section');
    const cards = document.querySelectorAll('.intent-card');
    const statement = document.getElementById('semantic-statement');
    if (section) section.classList.add('is-visible');

    cards.forEach((card, idx) => {
      window.setTimeout(() => card.classList.add('is-shown'), idx * 90);
    });

    window.setTimeout(() => {
      if (statement) statement.classList.add('is-shown');
      resolve();
    }, cards.length * 90 + 150);
  });
}

function resetIntentSection() {
  const section = document.getElementById('intent-section');
  const statement = document.getElementById('semantic-statement');
  const grid = document.getElementById('intent-grid');
  if (section) section.classList.remove('is-visible');
  if (statement) statement.classList.remove('is-shown');
  if (grid) grid.innerHTML = '';
}

/* ---------------------------------------------------------------------- */
/* Pipeline                                                                 */
/* ---------------------------------------------------------------------- */

const PIPELINE_ORDER = ['query', 'intent', 'archive', 'analysis', 'evidence'];

function setPipelineStage(stage) {
  state.pipelineStage = stage;
  const targetIdx = PIPELINE_ORDER.indexOf(stage);

  document.querySelectorAll('.pipeline-node').forEach((node) => {
    const nodeIdx = PIPELINE_ORDER.indexOf(node.dataset.stage);
    node.classList.remove('is-complete', 'is-active');
    if (nodeIdx < targetIdx) {
      node.classList.add('is-complete');
    } else if (nodeIdx === targetIdx) {
      node.classList.add('is-active');
    }
  });

  document.querySelectorAll('.pipeline-connector').forEach((conn) => {
    const idx = Number(conn.dataset.index);
    conn.classList.toggle('is-complete', idx < targetIdx);
  });
}

function resetPipeline() {
  document.querySelectorAll('.pipeline-node').forEach((node) => {
    node.classList.remove('is-complete', 'is-active');
  });
  document.querySelectorAll('.pipeline-connector').forEach((conn) => {
    conn.classList.remove('is-complete');
  });
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runPipelineAnimation() {
  setPipelineStage('query');
  await delay(280);
  setPipelineStage('intent');
  await delay(280);
  setPipelineStage('archive');
  await delay(420);
  setPipelineStage('analysis');
  await delay(420);
  setPipelineStage('evidence');
}

/* ---------------------------------------------------------------------- */
/* Result banner                                                           */
/* ---------------------------------------------------------------------- */

function showResultBanner(count) {
  const banner = document.getElementById('result-banner');
  const countEl = document.getElementById('result-count');
  if (!banner || !countEl) return;
  countEl.textContent = String(count);
  banner.classList.add('is-shown');
}

function resetResultBanner() {
  const banner = document.getElementById('result-banner');
  if (banner) banner.classList.remove('is-shown');
}

/* ---------------------------------------------------------------------- */
/* Run analysis flow                                                       */
/* ---------------------------------------------------------------------- */

async function runAnalysis() {
  if (state.isAnalyzing) return;

  const input = document.getElementById('query-input');
  const query = (input && input.value.trim()) || '';
  if (!query) {
    input?.focus();
    return;
  }

  state.query = query;
  state.isAnalyzing = true;

  const runBtn = document.getElementById('run-analysis-btn');
  if (runBtn) runBtn.disabled = true;

  resetStepper();
  resetIntentSection();
  resetResultBanner();
  resetPipeline();

  const panel = document.getElementById('interpretation-panel');
  if (panel) panel.hidden = false;
  panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  const intent = query === MISSION_PRESETS[0].query
    ? DEFAULT_INTENT
    : buildIntentForQuery(query);
  state.intent = intent;

  await runStepperAnimation();
  renderIntentCards(intent);
  await revealIntentSection();
  await runPipelineAnimation();
  showResultBanner(intent.candidateCount);

  state.isAnalyzing = false;
  if (runBtn) runBtn.disabled = false;
}

/* ---------------------------------------------------------------------- */
/* Init                                                                     */
/* ---------------------------------------------------------------------- */

function initContinueButton() {
  const btn = document.getElementById('continue-discovery-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.nav === 'discover');
    });
    showPage('discover');
    enterDiscovery(state.query, state.intent);
  });
}

function initQueryComposer() {
  const form = document.getElementById('query-form');
  const runBtn = document.getElementById('run-analysis-btn');

  form?.addEventListener('submit', (e) => e.preventDefault());
  runBtn?.addEventListener('click', runAnalysis);
}

function initChangeStudioEvents() {
  document.addEventListener('orbit:open-change-studio', (e) => {
    openChangeStudio(e.detail && e.detail.id);
  });
}

function init() {
  renderPresets();
  renderStepper();
  initNavigation();
  initReferenceOptions();
  initQueryComposer();
  initContinueButton();
  initModal();
  initDiscovery();
  initChangeStudio();
  initChangeStudioEvents();

  updateClock();
  window.setInterval(updateClock, 1000);
}

document.addEventListener('DOMContentLoaded', init);
