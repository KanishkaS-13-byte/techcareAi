export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved';
export type IssueCategory = 
  | 'Computer/OS'
  | 'Software'
  | 'Internet/Network'
  | 'Hardware'
  | 'Account/Security';

export interface TroubleshootingStep {
  title: string;
  detail: string;
  isCompleted?: boolean;
}

export interface SupportTicket {
  id: string; // unique UUID or ID
  ticketNumber: string; // e.g. TC-2026-1042
  title: string;
  description: string;
  category: IssueCategory;
  priority: Priority;
  status: TicketStatus;
  date: string; // YYYY-MM-DD
  updatedAt: string;
  reporterName?: string;
  deviceType?: string;
  suggestedSteps?: TroubleshootingStep[];
  resolutionNotes?: string;
}

export interface TroubleshootingResult {
  issueTitle: string;
  category: string;
  summary: string;
  possibleCauses: string[];
  troubleshootingSteps: TroubleshootingStep[];
  safetyNotice?: string;
  recommendedPriority?: Priority;
  preventiveTips?: string[];
}

export interface SoftwareAnalysisResult {
  softwareName: string;
  identifiedIssue: string;
  explanation: string;
  causes: string[];
  steps: TroubleshootingStep[];
  whatNotToDo: string[];
  whenToContactVendor: string;
}

export interface NetworkDiagnosisResult {
  symptom: string;
  connectionType: string;
  diagnosticSummary: string;
  quickChecks: Array<{ check: string; tip: string }>;
  steps: TroubleshootingStep[];
  safetyAndIspAdvice: string;
}

export interface EmailGenerationResult {
  subject: string;
  body: string;
  tips: string[];
}
