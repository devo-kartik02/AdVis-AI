export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin'; // 🎯 Updated from isAdmin for backend sync
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditSummary {
  visibility_score: number;
  placement: string;
  duration: string;
  recognizability: string;
  avg_confidence: number;
  distraction_rate: number;
  brand_text: string;
  audio_text: string;
  llm_verdict: string;
  llm_prompt?: string; // Optional field for debugging
}

export interface AuditResults {
  heatmapUrl?: string;
  peakFrameUrl?: string;
  summary?: AuditSummary;
}

export interface Audit {
  _id: string;
  user?: string; // Reference to the user ID
  fileName: string;
  fileType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  category: 'cosmetic' | 'food';
  originalUrl: string; // The raw upload link
  createdAt: string;
  updatedAt: string;
  aiResults?: AuditResults; // 🎯 Cleanly reusing the interface above
}

export interface Comparison {
  _id: string;
  user: string;
  auditA: Audit; // 🎯 Typically populated for the comparison UI
  auditB: Audit;
  winner: 'A' | 'B' | 'Tie';
  delta: {
    visibility: number;
    distraction: number;
  };
  insight: string;
  createdAt: string;
  updatedAt: string;
}