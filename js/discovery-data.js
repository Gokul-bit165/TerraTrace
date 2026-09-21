/* ==========================================================================
   ORBIT — Discovery Mock Data
   All data below is simulated for prototype demonstration purposes only.
   ========================================================================== */

// Map projection bounds for the mock AOI (Assam/Meghalaya border river corridor).
export const MAP_BOUNDS = {
  latMin: 24.740,
  latMax: 24.822,
  lonMin: 92.895,
  lonMax: 92.990,
};

export const SEARCH_INTENT = {
  target: 'Construction',
  relation: 'Near water',
  temporal: '2024–2026',
  persistence: 'Required',
};

function tierFor(semanticScore) {
  if (semanticScore >= 0.85) return 'high';
  if (semanticScore >= 0.65) return 'medium';
  return 'low';
}

const RAW_CANDIDATES = [
  { id: 'HX-0147', lat: 24.7802, lon: 92.9376, type: 'construction', semanticScore: 0.94, changeConfidence: 0.92, acquisitionDate: '2024-10-13', distanceToRiver: 420, sensor: 'Sentinel-2', cloudCoverage: 6, aoiArea: 2.4, cluster: 'A',
    supportingSignals: ['Structural similarity', 'River adjacency', 'Persistent signal', 'Multi-date support'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Seasonal pattern excluded', cleared: true }, { label: 'Registration passed', cleared: true }] },
  { id: 'HX-0148', lat: 24.7889, lon: 92.9421, type: 'construction', semanticScore: 0.91, changeConfidence: 0.88, acquisitionDate: '2024-11-02', distanceToRiver: 380, sensor: 'Sentinel-2', cloudCoverage: 9, aoiArea: 1.8, cluster: 'A',
    supportingSignals: ['Structural similarity', 'River adjacency', 'Multi-date support'],
    confounders: [{ label: 'Registration passed', cleared: true }, { label: 'Seasonal pattern excluded', cleared: true }] },
  { id: 'HX-0152', lat: 24.7734, lon: 92.9298, type: 'construction', semanticScore: 0.87, changeConfidence: 0.83, acquisitionDate: '2025-01-22', distanceToRiver: 610, sensor: 'Sentinel-2', cloudCoverage: 12, aoiArea: 3.1, cluster: 'A',
    supportingSignals: ['Structural similarity', 'Persistent signal', 'Multi-date support'],
    confounders: [{ label: 'Partial cloud occlusion', cleared: false }, { label: 'Registration passed', cleared: true }] },
  { id: 'HX-0155', lat: 24.7961, lon: 92.9502, type: 'construction', semanticScore: 0.83, changeConfidence: 0.79, acquisitionDate: '2025-03-08', distanceToRiver: 290, sensor: 'Sentinel-1', cloudCoverage: 18, aoiArea: 2.0, cluster: 'A',
    supportingSignals: ['River adjacency', 'Persistent signal'],
    confounders: [{ label: 'Shadow ambiguity', cleared: false }, { label: 'Multi-sensor agreement', cleared: true }] },
  { id: 'HX-0161', lat: 24.8046, lon: 92.9188, type: 'construction', semanticScore: 0.78, changeConfidence: 0.74, acquisitionDate: '2024-06-19', distanceToRiver: 950, sensor: 'Sentinel-2', cloudCoverage: 22, aoiArea: 1.5, cluster: 'B',
    supportingSignals: ['Structural similarity', 'Persistent signal'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Seasonal pattern excluded', cleared: true }] },
  { id: 'HX-0163', lat: 24.7688, lon: 92.9455, type: 'construction', semanticScore: 0.73, changeConfidence: 0.69, acquisitionDate: '2025-05-30', distanceToRiver: 1240, sensor: 'Sentinel-2', cloudCoverage: 15, aoiArea: 4.6, cluster: 'B',
    supportingSignals: ['Structural similarity', 'Multi-date support'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
  { id: 'HX-0170', lat: 24.7592, lon: 92.9612, type: 'construction', semanticScore: 0.68, changeConfidence: 0.71, acquisitionDate: '2024-08-04', distanceToRiver: 1830, sensor: 'Landsat', cloudCoverage: 28, aoiArea: 3.9, cluster: 'B',
    supportingSignals: ['Persistent signal'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Partial cloud occlusion', cleared: false }] },
  { id: 'HX-0174', lat: 24.7915, lon: 92.9701, type: 'road', semanticScore: 0.81, changeConfidence: 0.77, acquisitionDate: '2025-02-14', distanceToRiver: 2100, sensor: 'Sentinel-2', cloudCoverage: 10, aoiArea: 5.2, cluster: 'C',
    supportingSignals: ['Linear alignment detected', 'Multi-date support'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
  { id: 'HX-0176', lat: 24.8002, lon: 92.9333, type: 'road', semanticScore: 0.76, changeConfidence: 0.85, acquisitionDate: '2024-12-01', distanceToRiver: 1560, sensor: 'Sentinel-1', cloudCoverage: 14, aoiArea: 6.0, cluster: 'C',
    supportingSignals: ['Linear alignment detected', 'Multi-sensor agreement'],
    confounders: [{ label: 'Shadow ambiguity', cleared: false }] },
  { id: 'HX-0181', lat: 24.7723, lon: 92.9558, type: 'road', semanticScore: 0.71, changeConfidence: 0.66, acquisitionDate: '2025-07-09', distanceToRiver: 890, sensor: 'Sentinel-2', cloudCoverage: 8, aoiArea: 4.1, cluster: 'C',
    supportingSignals: ['Linear alignment detected'],
    confounders: [{ label: 'Seasonal pattern excluded', cleared: true }] },
  { id: 'HX-0183', lat: 24.8058, lon: 92.9445, type: 'road', semanticScore: 0.64, changeConfidence: 0.60, acquisitionDate: '2024-09-27', distanceToRiver: 2450, sensor: 'Sentinel-2', cloudCoverage: 20, aoiArea: 7.3, cluster: 'C',
    supportingSignals: ['Linear alignment detected'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Partial cloud occlusion', cleared: false }] },
  { id: 'HX-0190', lat: 24.7650, lon: 92.9203, type: 'clearance', semanticScore: 0.62, changeConfidence: 0.90, acquisitionDate: '2025-04-11', distanceToRiver: 700, sensor: 'Sentinel-2', cloudCoverage: 5, aoiArea: 2.8, cluster: null,
    supportingSignals: ['Vegetation loss consistent', 'Multi-date support'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
  { id: 'HX-0193', lat: 24.7841, lon: 92.9639, type: 'clearance', semanticScore: 0.58, changeConfidence: 0.72, acquisitionDate: '2024-05-16', distanceToRiver: 1340, sensor: 'Sentinel-1', cloudCoverage: 25, aoiArea: 3.5, cluster: null,
    supportingSignals: ['Vegetation loss consistent'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Seasonal pattern excluded', cleared: true }] },
  { id: 'HX-0196', lat: 24.7967, lon: 92.9267, type: 'clearance', semanticScore: 0.66, changeConfidence: 0.68, acquisitionDate: '2025-09-02', distanceToRiver: 480, sensor: 'Sentinel-2', cloudCoverage: 11, aoiArea: 2.2, cluster: null,
    supportingSignals: ['Vegetation loss consistent', 'Persistent signal'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
  { id: 'HX-0201', lat: 24.7756, lon: 92.9482, type: 'water', semanticScore: 0.55, changeConfidence: 0.64, acquisitionDate: '2024-07-23', distanceToRiver: 90, sensor: 'Sentinel-2', cloudCoverage: 7, aoiArea: 1.1, cluster: null,
    supportingSignals: ['River adjacency'],
    confounders: [{ label: 'Seasonal pattern excluded', cleared: true }] },
  { id: 'HX-0205', lat: 24.8087, lon: 92.9560, type: 'water', semanticScore: 0.52, changeConfidence: 0.58, acquisitionDate: '2025-06-05', distanceToRiver: 60, sensor: 'Sentinel-1', cloudCoverage: 30, aoiArea: 0.9, cluster: null,
    supportingSignals: ['River adjacency'],
    confounders: [{ label: 'Moderate haze', cleared: false }, { label: 'Multi-sensor agreement', cleared: true }] },
  { id: 'HX-0208', lat: 24.7614, lon: 92.9339, type: 'water', semanticScore: 0.60, changeConfidence: 0.62, acquisitionDate: '2024-03-29', distanceToRiver: 140, sensor: 'Sentinel-2', cloudCoverage: 4, aoiArea: 1.4, cluster: null,
    supportingSignals: ['River adjacency', 'Persistent signal'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
  { id: 'HX-0211', lat: 24.7877, lon: 92.9531, type: 'road', semanticScore: 0.89, changeConfidence: 0.86, acquisitionDate: '2025-01-21', distanceToRiver: 350, sensor: 'Sentinel-2', cloudCoverage: 9, aoiArea: 1.9, cluster: 'C',
    supportingSignals: ['Linear alignment detected', 'Persistent signal', 'Multi-date support'],
    confounders: [{ label: 'Registration passed', cleared: true }] },
];

export const CANDIDATES = RAW_CANDIDATES.map((c) => ({
  ...c,
  tier: tierFor(c.semanticScore),
  thumbnail: c.type,
}));

export const CLUSTERS = [
  { key: 'A', name: 'CLUSTER A', description: 'Construction near water' },
  { key: 'B', name: 'CLUSTER B', description: 'Facility expansion' },
  { key: 'C', name: 'CLUSTER C', description: 'Linear road growth' },
];

export const BASE_METRICS = {
  candidates: 87,
  highConfidence: 14,
  priority: 3,
  indexedScenes: '128K',
};

export const RETRIEVAL_STEPS = [
  'SEARCHING LOCAL ARCHIVE',
  'SEMANTIC INDEX',
  'SPATIAL FILTER',
  'TEMPORAL FILTER',
  'QUALITY FILTER',
];

export const RETRIEVAL_STATUS = [
  { key: 'archive', label: 'LOCAL ARCHIVE', value: 'READY' },
  { key: 'semantic', label: 'SEMANTIC INDEX', value: 'READY' },
  { key: 'spatial', label: 'SPATIAL INDEX', value: 'READY' },
  { key: 'temporal', label: 'TEMPORAL INDEX', value: 'READY' },
  { key: 'latency', label: 'QUERY LATENCY', value: '1.82 s' },
];
