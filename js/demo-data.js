/* ==========================================================================
   ORBIT — Demo / Mock Data
   All data below is simulated for prototype demonstration purposes only.
   ========================================================================== */

export const MISSION_PRESETS = [
  {
    label: 'NEW CONSTRUCTION',
    query: 'Show newly built structures near a river in the last 2 years',
  },
  {
    label: 'ROAD DEVELOPMENT',
    query: 'Identify new or widened roads connecting to the highway network since 2024',
  },
  {
    label: 'LAND CLEARANCE',
    query: 'Detect cleared vegetation or deforested patches larger than 2 hectares',
  },
  {
    label: 'FACILITY EXPANSION',
    query: 'Find facilities that have expanded their built footprint in the last 18 months',
  },
  {
    label: 'WATER CHANGE',
    query: 'Locate reservoirs or water bodies with significant extent change this year',
  },
];

const STEPPER_STEPS = [
  { key: 'received', label: 'QUERY RECEIVED' },
  { key: 'parsed', label: 'INTENT PARSED' },
  { key: 'spatial', label: 'SPATIAL RELATION IDENTIFIED' },
  { key: 'temporal', label: 'TEMPORAL WINDOW IDENTIFIED' },
  { key: 'target', label: 'TARGET OBJECT IDENTIFIED' },
];

export function getStepperSteps() {
  return STEPPER_STEPS;
}

// Default demonstration interpretation, keyed to the primary demo query.
export const DEFAULT_INTENT = {
  cards: [
    {
      label: 'LOCATION',
      value: 'River corridor',
      meta: 'Buffered 300m along waterway',
    },
    {
      label: 'TIME',
      value: '2024 → 2026',
      meta: '2-year observation window',
    },
    {
      label: 'TARGET',
      value: 'Construction',
      meta: 'Structural footprint growth',
    },
    {
      label: 'RELATION',
      value: 'Near river',
      meta: 'Spatial proximity constraint',
    },
    {
      label: 'CHANGE TYPE',
      value: 'New / persistent',
      meta: 'Requires 2+ confirming passes',
    },
  ],
  statement: 'Find persistent structural growth occurring near flowing water.',
  candidateCount: 87,
};

// Generic fallback interpretation used when the analyst runs a custom query
// that does not match a known preset. Kept deliberately similar in shape so
// the panel never looks broken, while remaining honest that this is mocked.
export function buildIntentForQuery(query) {
  const lower = query.toLowerCase();

  if (lower.includes('road')) {
    return {
      cards: [
        { label: 'LOCATION', value: 'Highway corridor', meta: 'Linear feature buffer' },
        { label: 'TIME', value: '2024 → 2026', meta: '2-year observation window' },
        { label: 'TARGET', value: 'Road development', meta: 'Surface / alignment change' },
        { label: 'RELATION', value: 'Connects to network', meta: 'Topological linkage' },
        { label: 'CHANGE TYPE', value: 'New / widened', meta: 'Requires 2+ confirming passes' },
      ],
      statement: 'Find new or widened road surfaces linked to the existing network.',
      candidateCount: 54,
    };
  }

  if (lower.includes('clear') || lower.includes('vegetation') || lower.includes('forest')) {
    return {
      cards: [
        { label: 'LOCATION', value: 'Vegetated terrain', meta: 'Land-cover baseline' },
        { label: 'TIME', value: '2024 → 2026', meta: '2-year observation window' },
        { label: 'TARGET', value: 'Land clearance', meta: 'Canopy / cover loss' },
        { label: 'RELATION', value: 'Contiguous area', meta: 'Minimum patch size 2 ha' },
        { label: 'CHANGE TYPE', value: 'Loss / removal', meta: 'Requires 2+ confirming passes' },
      ],
      statement: 'Find contiguous vegetation loss exceeding the minimum patch threshold.',
      candidateCount: 41,
    };
  }

  if (lower.includes('facilit') || lower.includes('expan')) {
    return {
      cards: [
        { label: 'LOCATION', value: 'Facility perimeter', meta: 'Site boundary buffer' },
        { label: 'TIME', value: '2024 → 2026', meta: '18-month observation window' },
        { label: 'TARGET', value: 'Facility expansion', meta: 'Built-footprint growth' },
        { label: 'RELATION', value: 'Within site boundary', meta: 'Spatial containment' },
        { label: 'CHANGE TYPE', value: 'Expansion', meta: 'Requires 2+ confirming passes' },
      ],
      statement: 'Find built-footprint growth within known facility boundaries.',
      candidateCount: 29,
    };
  }

  if (lower.includes('water') || lower.includes('reservoir') || lower.includes('river')) {
    return {
      cards: [
        { label: 'LOCATION', value: 'Water body extent', meta: 'Shoreline baseline' },
        { label: 'TIME', value: '2025 → 2026', meta: '1-year observation window' },
        { label: 'TARGET', value: 'Water-extent change', meta: 'Surface area delta' },
        { label: 'RELATION', value: 'Within basin', meta: 'Hydrological boundary' },
        { label: 'CHANGE TYPE', value: 'Expansion / recession', meta: 'Requires 2+ confirming passes' },
      ],
      statement: 'Find significant water-extent change within the mapped basin.',
      candidateCount: 33,
    };
  }

  // Default falls back to the construction / river narrative.
  return DEFAULT_INTENT;
}

export { STEPPER_STEPS };
