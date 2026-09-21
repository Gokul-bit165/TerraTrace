/* ==========================================================================
   ORBIT — Application State
   ========================================================================== */

const state = {
  currentPage: 'mission',
  query: '',
  isAnalyzing: false,
  intent: null,
  pipelineStage: 'idle', // idle | query | intent | archive | analysis | evidence
};

export default state;
