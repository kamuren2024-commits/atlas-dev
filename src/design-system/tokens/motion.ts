export const motionTokens = {
  transition: {
    fast: { duration: 0.12, ease: 'easeInOut' },
    normal: { duration: 0.22, ease: 'easeInOut' },
    slow: { duration: 0.35, ease: 'easeInOut' },
  },
  // Semantic interaction motion — motion = meaning
  interaction: {
    navigation: { duration: 0.12, ease: [0.16, 1, 0.3, 1] },       // Fast — navigation should feel instant
    panelOpen: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },        // Smooth — panels reveal with ease
    intelligenceLoad: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },  // Progressive — intelligence appears deliberately
    graphExpand: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },   // Organic — graph relationships form naturally
    alert: { duration: 0.08, ease: 'easeOut' },                     // Immediate — alerts demand attention
    agentReasoning: { duration: 0.6, ease: 'easeInOut' },           // Sequential — AI reasoning unfolds step-by-step
    dataReveal: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },       // Calm — data appears with purpose
  },
  duration: {
    fast: 120, // ms
    normal: 220, // ms
    slow: 350, // ms
  }
};
