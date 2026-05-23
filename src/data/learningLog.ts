import { LearningLogEntry } from '../types/os';

export const seededLearningLog: LearningLogEntry[] = [
  {
    id: 'learn-001',
    source: 'Post-release Analytics Stack',
    observation: 'High drop-off rate on standard landing CTA within mobile containers.',
    evidence: 'Bounce rate on /home increased by 42% on mobile viewport resize requests.',
    interpretation: 'Visual buttons on navigation overlay are covering up primary CTA links, preventing smooth finger taps.',
    confidence: 0.94,
    recommendedAction: 'Apply responsive padding shifts on mobile header layout, and adjust CSS z-index.',
    approvalStatus: 'APPROVED',
    memoryUpdateRecommended: true
  },
  {
    id: 'learn-002',
    source: 'Feedback Director Agent',
    observation: 'AI drafting agent produces overly flowery text outputs if not explicitly constrained.',
    evidence: 'Adjectives density per paragraph is 25% higher than CEO personal writing samples.',
    interpretation: 'The prompt framework lacks a strong direct negative instruction targeting generic AI adjectives (e.g. "comprehensive", "dive", "revolutionizing").',
    confidence: 0.88,
    recommendedAction: 'Inject explicit negative styling constraints into AI Drafting Agent reference guidelines.',
    approvalStatus: 'PENDING',
    memoryUpdateRecommended: true
  },
  {
    id: 'learn-003',
    source: 'SEO Distribution Agent',
    observation: 'High impressions but low click-through-rate for keyword phrase "autonomous marketing agents".',
    evidence: 'Impressions: 12,400. Clicks: 152. Position: 4.8.',
    interpretation: 'Search snippet meta description is clinical and lacks a strong hooks matching user search intent.',
    confidence: 0.75,
    recommendedAction: 'Rewrite SEO tag templates to include direct metrics validation statements.',
    approvalStatus: 'PENDING',
    memoryUpdateRecommended: false
  }
];
