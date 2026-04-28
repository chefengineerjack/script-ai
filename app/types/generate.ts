export type GenerateRequest = {
  ownIndustry: string;
  targetIndustry: string;
  targetCompany?: string;
  targetDepartment?: string;
  product: string;
  webSearch: boolean;
  position: string;
  purpose: string;
  scriptType: "call" | "email" | "both";
};

// ── Phone ──────────────────────────────────────────────────

export type PhonePersona = {
  description: string;
  painPoints: string[];
  decisionCriteria: string;
};

export type Hearing = {
  situation: string;
  problem: string;
  implication: string;
  needPayoff: string;
  note: string;
};

export type Objection = {
  text: string;
  empathy: string;
  question: string;
  reproposal: string;
  shouldContinue: boolean;
  continueReason: string;
  frequency: 1 | 2 | 3;
};

export type FlowNode = {
  id: string;
  label: string;
  type: "talk" | "hearing" | "closing" | "end";
  goalResponse?: string;
  nextOnPositive?: string;
  nextOnNegative?: string;
};

export type ObjectionNode = {
  id: string;
  trigger: string;
  response: string;
  retryCount: number;
  maxRetry: number;
  nextOnSuccess: string;
  nextOnFail: string;
};

export type FlowChart = {
  nodes: FlowNode[];
  objectionNodes: ObjectionNode[];
};

export type PhoneScript = {
  persona: PhonePersona;
  greeting: string;
  greetingNote: string;
  hook: string;
  hearing: Hearing;
  mainTalk: string;
  mainTalkNote: string;
  dataPoint: string;
  closing: string;
  closingNote: string;
  objections: Objection[];
  flowChart: FlowChart;
};

// ── Email ──────────────────────────────────────────────────

export type EmailPersona = {
  description: string;
  readingContext: string;
  departmentChallenges: string[];
};

export type EmailTemplate = {
  subject: string;
  body: string;
  sendTiming: string;
  note: string;
  goalAction: string;
};

export type EmailScript = {
  persona: EmailPersona;
  initial: EmailTemplate;
  followup: EmailTemplate;
  reapproach: EmailTemplate;
  sequence: string;
};

// ── Company Analysis ───────────────────────────────────────

export type EstimatedChallenge = {
  challenge: string;
  relevance: "高" | "中";
};

export type CompanyAnalysis = {
  companyName: string;
  vision: string;
  midTermPlan: string;
  departmentRelevance: string;
  recentNews: string;
  estimatedChallenges: EstimatedChallenge[];
  approachAdvice: string;
};

// ── Plan restrictions ──────────────────────────────────────

export type PlanRestrictions = {
  companyAnalysisLocked: boolean;
  flowChartLocked: boolean;
};

// ── Result ─────────────────────────────────────────────────

export type GenerateResult = {
  phone?: PhoneScript;
  email?: EmailScript;
  companyAnalysis?: CompanyAnalysis;
  planRestrictions?: PlanRestrictions;
};
