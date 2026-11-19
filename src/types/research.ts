export type UserRole = 'jury' | 'student_duc_anh' | 'student_khanh_an' | 'teacher_thuy_mai';

export type DateCertainty = 'exact' | 'range_verified' | 'retrospective_estimate';

export type DataOriginType = 'original_record' | 'retrospective_reconstruction' | 'analytical_inference';

export type ReviewStatus = 'draft' | 'pending_review' | 'verified' | 'revision_requested';

export type StageStatus = 'completed' | 'in_progress' | 'verified';

export type EvidenceType =
  | 'image'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'video'
  | 'source_code'
  | 'survey_dataset';

export interface ResearchStage {
  id: string;
  stageNumber: number;
  title: string;
  period: string;
  shortDescription: string;
  status: StageStatus;
  activities: string[];
  updatedBy: string;
  updatedAt?: unknown;
}

export interface JournalEntry {
  id: string;
  code: string;
  orderIndex: number;
  stageNumber: number;
  activityName: string;
  actualDateOrRange: string;
  dateCertainty: DateCertainty;
  dataOriginType: DataOriginType;
  location: string;
  performer: string;
  collaborators: string;
  objective: string;
  workDone: string;
  method: string;
  actualResult: string;
  difficulties: string;
  solutions: string;
  lessonsLearned: string;
  nextSteps: string;
  evidenceSummary: string;
  reviewStatus: ReviewStatus;
  teacherComment: string;
  teacherConfirmationNote: string;
  verifiedAt: string;
  version: number;
  revisionHistory: string[];
  authorUid: string;
  authorName: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  systemEntryDateLabel?: string;
}

export interface EvidenceItem {
  id: string;
  fileName: string;
  description: string;
  evidenceType: EvidenceType;
  mimeType: string;
  fileSize: number;
  storageUrl: string;
  previewDataUrl: string;
  providerName: string;
  collectionDate: string;
  journalCode: string;
  stageNumber: number;
  isApprovedForJury: boolean;
  isFeatured: boolean;
  uploadedByUid: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  uploadedDateLabel?: string;
}

export interface AppendixDocument {
  id: string;
  appendixCode: string;
  title: string;
  description: string;
  responsiblePerson: string;
  status: StageStatus;
  fileName: string;
  fileUrl: string;
  contentSummary: string;
  updatedLabel: string;
  updatedByUid: string;
  updatedAt?: unknown;
}

export interface ProjectOverviewMetrics {
  totalStages: number;
  journalCount: number;
  approvedEvidenceCount: number;
  verifiedJournalCount: number;
}
