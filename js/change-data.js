/* ==========================================================================
   ORBIT — Change Studio Mock Data
   All data below is simulated for prototype demonstration purposes only.
   ========================================================================== */

// Shared observation calendar used by every site's temporal trajectory.
const DATE_CALENDAR = [
  { date: '2023-03-15', label: 'MAR 2023' },
  { date: '2023-07-20', label: 'JUL 2023' },
  { date: '2023-11-08', label: 'NOV 2023' },
  { date: '2024-03-05', label: 'MAR 2024' },
  { date: '2024-07-16', label: 'JUL 2024' },
  { date: '2024-10-13', label: 'OCT 2024' },
  { date: '2025-01-21', label: 'JAN 2025' },
  { date: '2025-03-30', label: 'MAR 2025' },
];

function sceneIdFor(dateStr, idx) {
  const compact = dateStr.replace(/-/g, '');
  return `S2${idx % 2 === 0 ? 'A' : 'B'}_MSIL2A_${compact}`;
}

function buildDates(perIndex) {
  return DATE_CALENDAR.map((d, idx) => ({
    ...d,
    sceneId: sceneIdFor(d.date, idx),
    sensor: 'Sentinel-2',
    ...perIndex[idx],
  }));
}

export const CHANGE_SITES = {
  'HX-0147': {
    id: 'HX-0147',
    displayId: '#0147',
    type: 'construction',
    typeLabel: 'NEW CONSTRUCTION',
    lat: 24.7802,
    lon: 92.9376,
    sceneKind: 'river',
    footprintCenter: { x: 460, y: 250 },
    footprintBaseSize: 46,
    semanticMatch: 0.94,
    changeConfidence: 0.92,
    status: 'CHANGE SUPPORTED',
    earliestSupportedIndex: 5,
    earliestSupportedUncertaintyDays: 34,
    affectedArea: 2840,
    observationsCount: 7,
    persistenceObservations: 4,
    sensors: ['Sentinel-2'],
    dates: buildDates([
      { state: 'baseline', footprint: 'none', confidence: 0.10, cloud: 8, validPixels: 97, note: 'No structure' },
      { state: 'baseline', footprint: 'none', confidence: 0.13, cloud: 14, validPixels: 92, note: 'No persistent structural signal' },
      { state: 'baseline', footprint: 'none', confidence: 0.16, cloud: 11, validPixels: 95, note: 'No meaningful change' },
      { state: 'early-signal', footprint: 'faint', confidence: 0.35, cloud: 19, validPixels: 88, note: 'Minor disturbance' },
      { state: 'early-signal', footprint: 'small', confidence: 0.52, cloud: 13, validPixels: 93, note: 'Early surface disturbance' },
      { state: 'emerging', footprint: 'initial', confidence: 0.74, cloud: 6, validPixels: 94, note: 'Structural signal emerges' },
      { state: 'supported', footprint: 'confirmed', confidence: 0.87, cloud: 9, validPixels: 96, note: 'Structure confirmed' },
      { state: 'confirmed', footprint: 'expanded', confidence: 0.92, cloud: 7, validPixels: 97, note: 'Structural expansion confirmed' },
    ]),
    supportingSignals: [
      'Structural footprint increased',
      'Persistent across observations',
      'Spatial footprint consistent',
      'River adjacency remains stable',
      'Change persists beyond one observation',
    ],
    confounders: [
      { label: 'Moderate haze on 13 Oct 2024', cleared: false },
      { label: 'Seasonal variation checked', cleared: true },
      { label: 'Registration alignment passed', cleared: true },
    ],
    whyReasoning: [
      { title: 'BASELINE', body: 'Previous observations show no persistent structural footprint.' },
      { title: 'CHANGE ONSET', body: 'A new surface pattern appears during mid-2024.' },
      { title: 'PERSISTENCE', body: 'The signal remains visible across multiple subsequent observations.' },
      { title: 'VALIDATION', body: 'The footprint is spatially consistent and survives quality/confounder checks.' },
      { title: 'ASSESSMENT', body: 'Persistent structural expansion is supported.' },
    ],
    quality: { registration: 'PASS', seasonality: 'PASS', radiometric: 'PASS' },
    provenance: {
      source: 'Sentinel-2 L2A',
      scenes: 7,
      processing: ['Geometric normalization', 'Cloud masking', 'Temporal normalization', 'Spatial alignment', 'Change analysis'],
      model: 'CCDC-style temporal analysis',
      index: 'Local spatial + semantic index',
    },
  },

  'HX-0211': {
    id: 'HX-0211',
    displayId: '#0211',
    type: 'road',
    typeLabel: 'ROAD DEVELOPMENT',
    lat: 24.7877,
    lon: 92.9531,
    sceneKind: 'road',
    footprintCenter: { x: 400, y: 280 },
    footprintBaseSize: 40,
    semanticMatch: 0.89,
    changeConfidence: 0.86,
    status: 'CHANGE SUPPORTED',
    earliestSupportedIndex: 6,
    earliestSupportedUncertaintyDays: 28,
    affectedArea: 6100,
    observationsCount: 7,
    persistenceObservations: 3,
    sensors: ['Sentinel-2', 'Sentinel-1'],
    dates: buildDates([
      { state: 'baseline', footprint: 'none', confidence: 0.09, cloud: 10, validPixels: 96, note: 'No linear feature' },
      { state: 'baseline', footprint: 'none', confidence: 0.12, cloud: 16, validPixels: 90, note: 'No persistent track signal' },
      { state: 'baseline', footprint: 'none', confidence: 0.14, cloud: 12, validPixels: 94, note: 'No meaningful change' },
      { state: 'early-signal', footprint: 'none', confidence: 0.22, cloud: 20, validPixels: 87, note: 'Vegetation disturbance only' },
      { state: 'early-signal', footprint: 'faint', confidence: 0.41, cloud: 15, validPixels: 91, note: 'Informal track appears' },
      { state: 'emerging', footprint: 'small', confidence: 0.58, cloud: 14, validPixels: 92, note: 'Graded surface visible' },
      { state: 'emerging', footprint: 'initial', confidence: 0.79, cloud: 8, validPixels: 95, note: 'Surface pattern consistent' },
      { state: 'confirmed', footprint: 'confirmed', confidence: 0.86, cloud: 9, validPixels: 96, note: 'Paved segment confirmed' },
    ]),
    supportingSignals: [
      'Linear alignment detected',
      'Connects to existing network',
      'Surface signature consistent',
      'Persistent across observations',
    ],
    confounders: [
      { label: 'Shadow ambiguity on 21 Jan 2025', cleared: false },
      { label: 'Seasonal variation checked', cleared: true },
      { label: 'Registration alignment passed', cleared: true },
    ],
    whyReasoning: [
      { title: 'BASELINE', body: 'Previous observations show no linear surface feature.' },
      { title: 'CHANGE ONSET', body: 'An informal track becomes visible in mid-to-late 2024.' },
      { title: 'PERSISTENCE', body: 'The alignment remains visible and sharpens across subsequent observations.' },
      { title: 'VALIDATION', body: 'The alignment connects to the existing network and survives confounder checks.' },
      { title: 'ASSESSMENT', body: 'Persistent road development is supported.' },
    ],
    quality: { registration: 'PASS', seasonality: 'PASS', radiometric: 'PASS' },
    provenance: {
      source: 'Sentinel-2 L2A + Sentinel-1 GRD',
      scenes: 7,
      processing: ['Geometric normalization', 'Cloud masking', 'Temporal normalization', 'Spatial alignment', 'Change analysis'],
      model: 'CCDC-style temporal analysis',
      index: 'Local spatial + semantic index',
    },
  },

  'HX-0318': {
    id: 'HX-0318',
    displayId: '#0318',
    type: 'facility',
    typeLabel: 'FACILITY EXPANSION',
    lat: 24.8046,
    lon: 92.9188,
    sceneKind: 'facility',
    footprintCenter: { x: 430, y: 270 },
    footprintBaseSize: 52,
    semanticMatch: 0.81,
    changeConfidence: 0.81,
    status: 'CHANGE SUPPORTED',
    earliestSupportedIndex: 4,
    earliestSupportedUncertaintyDays: 21,
    affectedArea: 4320,
    observationsCount: 7,
    persistenceObservations: 4,
    sensors: ['Sentinel-2'],
    dates: buildDates([
      { state: 'baseline', footprint: 'none', confidence: 0.14, cloud: 9, validPixels: 96, note: 'No expansion footprint' },
      { state: 'baseline', footprint: 'none', confidence: 0.19, cloud: 15, validPixels: 91, note: 'No persistent signal' },
      { state: 'early-signal', footprint: 'faint', confidence: 0.33, cloud: 12, validPixels: 94, note: 'Perimeter disturbance' },
      { state: 'early-signal', footprint: 'small', confidence: 0.49, cloud: 17, validPixels: 90, note: 'Grading activity visible' },
      { state: 'emerging', footprint: 'initial', confidence: 0.68, cloud: 10, validPixels: 95, note: 'Expansion footprint emerges' },
      { state: 'supported', footprint: 'confirmed', confidence: 0.75, cloud: 11, validPixels: 95, note: 'Expansion confirmed' },
      { state: 'supported', footprint: 'confirmed', confidence: 0.79, cloud: 8, validPixels: 97, note: 'Expansion stable' },
      { state: 'confirmed', footprint: 'expanded', confidence: 0.81, cloud: 9, validPixels: 96, note: 'Expansion consistent across observations' },
    ]),
    supportingSignals: [
      'Structural footprint increased',
      'Adjacent to existing facility perimeter',
      'Persistent across observations',
      'Spatial footprint consistent',
    ],
    confounders: [
      { label: 'Partial cloud occlusion on 16 Jul 2024', cleared: false },
      { label: 'Seasonal variation checked', cleared: true },
      { label: 'Registration alignment passed', cleared: true },
    ],
    whyReasoning: [
      { title: 'BASELINE', body: 'Previous observations show no expansion beyond the existing facility perimeter.' },
      { title: 'CHANGE ONSET', body: 'Grading and perimeter disturbance appear during mid-2024.' },
      { title: 'PERSISTENCE', body: 'The expanded footprint remains visible across subsequent observations.' },
      { title: 'VALIDATION', body: 'The footprint is spatially consistent and survives quality/confounder checks.' },
      { title: 'ASSESSMENT', body: 'Persistent facility expansion is supported.' },
    ],
    quality: { registration: 'PASS', seasonality: 'PASS', radiometric: 'PASS' },
    provenance: {
      source: 'Sentinel-2 L2A',
      scenes: 7,
      processing: ['Geometric normalization', 'Cloud masking', 'Temporal normalization', 'Spatial alignment', 'Change analysis'],
      model: 'CCDC-style temporal analysis',
      index: 'Local spatial + semantic index',
    },
  },
};

export const DEFAULT_CHANGE_SITE_ID = 'HX-0147';
