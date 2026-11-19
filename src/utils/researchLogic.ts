import {
  AppendixDocument,
  EvidenceItem,
  JournalEntry,
  ProjectOverviewMetrics,
  ResearchStage,
  UserRole,
} from '../types/research';

/**
 * Computes the 4 overview metrics strictly from actual stored records.
 * When role is 'jury', journalCount and approvedEvidenceCount reflect jury-visible records.
 */
export function calculateOverviewMetrics(
  stages: ResearchStage[],
  journals: JournalEntry[],
  evidences: EvidenceItem[],
  role: UserRole
): ProjectOverviewMetrics {
  const visibleJournals =
    role === 'jury'
      ? journals.filter((j) => j.reviewStatus === 'verified')
      : journals;

  const verifiedJournals = journals.filter((j) => j.reviewStatus === 'verified');
  const approvedEvidences = evidences.filter((e) => e.isApprovedForJury === true);

  return {
    totalStages: stages.length,
    journalCount: visibleJournals.length,
    approvedEvidenceCount: approvedEvidences.length,
    verifiedJournalCount: verifiedJournals.length,
  };
}

/**
 * Filters journal entries based on user role, search query, stage filter, and performer filter.
 * Jury role strictly only sees verified entries.
 */
export function filterJournalsForRole(
  journals: JournalEntry[],
  role: UserRole,
  options?: {
    stageFilter?: number | 'all';
    performerFilter?: string | 'all';
    searchQuery?: string;
  }
): JournalEntry[] {
  let list =
    role === 'jury'
      ? journals.filter((j) => j.reviewStatus === 'verified')
      : [...journals];

  if (options?.stageFilter && options.stageFilter !== 'all') {
    list = list.filter((j) => j.stageNumber === options.stageFilter);
  }

  if (options?.performerFilter && options.performerFilter !== 'all') {
    const p = options.performerFilter.toLowerCase();
    list = list.filter(
      (j) =>
        j.performer.toLowerCase().includes(p) ||
        j.collaborators.toLowerCase().includes(p)
    );
  }

  if (options?.searchQuery && options.searchQuery.trim() !== '') {
    const q = options.searchQuery.trim().toLowerCase();
    list = list.filter(
      (j) =>
        j.code.toLowerCase().includes(q) ||
        j.activityName.toLowerCase().includes(q) ||
        j.workDone.toLowerCase().includes(q) ||
        j.actualResult.toLowerCase().includes(q) ||
        j.evidenceSummary.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => a.orderIndex - b.orderIndex);
}

/**
 * Filters evidence items based on role. Jury strictly sees only approved evidence.
 */
export function filterEvidencesForRole(
  evidences: EvidenceItem[],
  role: UserRole,
  stageFilter?: number | 'all',
  journalCodeFilter?: string | 'all'
): EvidenceItem[] {
  let list =
    role === 'jury'
      ? evidences.filter((e) => e.isApprovedForJury === true)
      : [...evidences];

  if (stageFilter && stageFilter !== 'all') {
    list = list.filter((e) => e.stageNumber === stageFilter);
  }

  if (journalCodeFilter && journalCodeFilter !== 'all') {
    list = list.filter((e) => e.journalCode === journalCodeFilter);
  }

  return list;
}

/**
 * Enforces versioned immutability when editing a journal entry.
 * If the entry was already verified by the teacher ('verified'), editing creates
 * a new version (version + 1), appends an audit note to revisionHistory (bounded to 20),
 * and resets reviewStatus to 'pending_review' so the teacher must re-confirm.
 */
export function buildNextJournalRevision(
  existingEntry: JournalEntry,
  updates: Partial<JournalEntry>,
  editorName: string,
  timestampLabel: string
): JournalEntry {
  const wasVerified = existingEntry.reviewStatus === 'verified';
  const nextVersion = wasVerified ? existingEntry.version + 1 : existingEntry.version;
  const nextStatus = wasVerified
    ? 'pending_review'
    : updates.reviewStatus || existingEntry.reviewStatus;

  const auditNote = wasVerified
    ? `v${nextVersion} (${timestampLabel}) - Chỉnh sửa sau xác nhận bởi ${editorName}: Tạo phiên bản mới chờ GVHD duyệt lại`
    : `v${nextVersion} (${timestampLabel}) - Cập nhật bởi ${editorName}`;

  const nextHistory = [...existingEntry.revisionHistory, auditNote].slice(-20);

  return {
    ...existingEntry,
    ...updates,
    code: existingEntry.code, // Immutable
    authorUid: existingEntry.authorUid, // Immutable
    createdAt: existingEntry.createdAt, // Immutable
    reviewStatus: nextStatus,
    version: nextVersion,
    revisionHistory: nextHistory,
  };
}

/**
 * Generates clean Markdown export conforming exactly to Appendix VIII of Plan 5999/KH-SGDĐT.
 */
export function generateAppendixVIIIExportMarkdown(
  journals: JournalEntry[],
  appendices: AppendixDocument[]
): string {
  const sorted = [...journals].sort((a, b) => a.orderIndex - b.orderIndex);
  const rows = sorted
    .map(
      (j) =>
        `| ${j.orderIndex} | ${j.actualDateOrRange} | ${j.workDone.replace(/\n/g, ' ')} | ${j.location} | ${j.performer} | ${j.evidenceSummary} | ${j.actualResult} | ${j.teacherConfirmationNote || (j.reviewStatus === 'verified' ? 'Đã xác nhận' : 'Chờ xác nhận')} |`
    )
    .join('\n');

  const appendixRows = appendices
    .map(
      (a) =>
        `- **${a.appendixCode} - ${a.title}**: ${a.fileName} (${a.responsiblePerson} · Cập nhật: ${a.updatedLabel})`
    )
    .join('\n');

  return `# PHỤ LỤC VIII
*(Kèm theo Kế hoạch số 5999/SGDĐT-GDTrH ngày 16 tháng 10 năm 2026 của Sở GDĐT)*

# NHẬT KÝ NGHIÊN CỨU VÀ MINH CHỨNG DỮ LIỆU

## I - THÔNG TIN CHUNG
- **Tên dự án dự thi**: Nghiên cứu hành vi tìm đến AI trước khi tự thử giải bài tập và thử nghiệm trạm RESET-AI nhằm tái hình thành thói quen tư duy độc lập cho học sinh Trường THPT Chuyên Bắc Kạn (Tên trong Phụ lục VIII: Nghiên cứu hành vi phụ thuộc AI tạo sinh khi giải bài tập và thử nghiệm trạm RESET-AI tích hợp quy trình 3T nhằm tăng tính tự lực học tập của học sinh Trường THPT Chuyên Bắc Kạn)
- **Lĩnh vực dự thi**: Khoa học xã hội và hành vi
- **Họ và tên học sinh/nhóm trưởng**: Vương Đức Anh – Lớp 12 Hóa Sinh
- **Họ và tên thành viên**: Đàm Khánh An – Lớp 11 Hóa
- **Họ và tên người hướng dẫn nghiên cứu**: Vũ Thúy Mai
- **Đơn vị dự thi**: Trường THPT Chuyên Bắc Kạn
- **Thời gian thực hiện**: Từ ngày 01/8/2026 đến ngày 18/11/2026
- **Tính chất hồ sơ**: Hồ sơ tổng hợp bổ sung và số hóa từ quá trình nghiên cứu thực tế đã thực hiện.

## II - NHẬT KÝ THỰC HIỆN

| TT | Ngày | Nội dung | Địa điểm thực hiện | Người thực hiện | Minh chứng | Kết quả | Xác nhận của GVHD |
|---|---|---|---|---|---|---|---|
${rows}

## III - DANH MỤC HỒ SƠ KHOA HỌC ĐÍNH KÈM
${appendixRows}

*Bắc Kạn, ngày 18 tháng 11 năm 2026*
- **Giáo viên hướng dẫn**: Vũ Thúy Mai
- **Trưởng nhóm nghiên cứu**: Vương Đức Anh
`;
}
