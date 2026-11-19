import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNextJournalRevision,
  calculateOverviewMetrics,
  filterEvidencesForRole,
  filterJournalsForRole,
  generateAppendixVIIIExportMarkdown,
} from './researchLogic';
import { EvidenceItem, JournalEntry, ResearchStage } from '../types/research';

const sampleStages: ResearchStage[] = [
  {
    id: 'stage-1',
    stageNumber: 1,
    title: 'Giai đoạn 1',
    period: '01/8 – 31/8/2026',
    shortDescription: 'Mô tả GĐ 1',
    status: 'verified',
    activities: ['Họp nhóm'],
    updatedBy: 'system',
  },
  {
    id: 'stage-2',
    stageNumber: 2,
    title: 'Giai đoạn 2',
    period: '01/10 – 18/11/2026',
    shortDescription: 'Mô tả GĐ 2',
    status: 'completed',
    activities: ['Khảo sát'],
    updatedBy: 'system',
  },
];

const sampleJournals: JournalEntry[] = [
  {
    id: 'j-1',
    code: 'NK-01',
    orderIndex: 1,
    stageNumber: 1,
    activityName: 'Họp nhóm lần 1',
    actualDateOrRange: '01/8/2026',
    dateCertainty: 'exact',
    dataOriginType: 'original_record',
    location: 'Trường THPT Chuyên Bắc Kạn',
    performer: 'Cả nhóm',
    collaborators: 'GV Vũ Thúy Mai',
    objective: 'Xác định hướng đề tài',
    workDone: 'Trao đổi vấn đề thực tiễn sử dụng AI',
    method: 'Thảo luận nhóm',
    actualResult: 'Xác định 2-3 hướng ý tưởng',
    difficulties: 'Chưa thống nhất cỡ mẫu',
    solutions: 'Đọc thêm tài liệu',
    lessonsLearned: 'Cần bám sát thực tế trường',
    nextSteps: 'Tổng quan tài liệu',
    evidenceSummary: 'Biên bản họp',
    reviewStatus: 'verified',
    teacherComment: 'Đã duyệt nội dung',
    teacherConfirmationNote: 'Xác nhận T8',
    verifiedAt: '31/8/2026',
    version: 1,
    revisionHistory: ['v1 - Khởi tạo từ Phụ lục VIII'],
    authorUid: 'u1',
    authorName: 'Vương Đức Anh',
  },
  {
    id: 'j-2',
    code: 'NK-02',
    orderIndex: 2,
    stageNumber: 2,
    activityName: 'Bản nháp bổ sung khảo sát',
    actualDateOrRange: '18/11/2026',
    dateCertainty: 'exact',
    dataOriginType: 'retrospective_reconstruction',
    location: 'Tại nhà',
    performer: 'Đàm Khánh An',
    collaborators: 'Vương Đức Anh',
    objective: 'Bổ sung ghi chú làm sạch dữ liệu',
    workDone: 'Kiểm tra 390 phiếu',
    method: 'Thống kê mô tả',
    actualResult: 'Hoàn tất bảng tần số',
    difficulties: 'Không có',
    solutions: 'Không có',
    lessonsLearned: 'Kiểm tra kỹ dòng trống',
    nextSteps: 'Đưa vào báo cáo',
    evidenceSummary: 'File Excel',
    reviewStatus: 'draft',
    teacherComment: '',
    teacherConfirmationNote: '',
    verifiedAt: '',
    version: 1,
    revisionHistory: ['v1 - Bản nháp'],
    authorUid: 'u2',
    authorName: 'Đàm Khánh An',
  },
];

const sampleEvidences: EvidenceItem[] = [
  {
    id: 'ev-1',
    fileName: 'So_do_khoi_RESET_AI.svg',
    description: 'Sơ đồ khối ESP32-S3',
    evidenceType: 'image',
    mimeType: 'image/svg+xml',
    fileSize: 10240,
    storageUrl: '',
    previewDataUrl: 'data:image/svg+xml;utf8,<svg></svg>',
    providerName: 'Vương Đức Anh',
    collectionDate: '10/9/2026',
    journalCode: 'NK-05',
    stageNumber: 3,
    isApprovedForJury: true,
    isFeatured: true,
    uploadedByUid: 'u1',
  },
  {
    id: 'ev-2',
    fileName: 'Ban_nhap_chua_duyet.docx',
    description: 'Tài liệu nháp chưa duyệt',
    evidenceType: 'word',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 20480,
    storageUrl: '',
    previewDataUrl: '',
    providerName: 'Đàm Khánh An',
    collectionDate: '12/11/2026',
    journalCode: 'NK-12',
    stageNumber: 2,
    isApprovedForJury: false,
    isFeatured: false,
    uploadedByUid: 'u2',
  },
];

test('calculateOverviewMetrics computes real counts and filters unverified records for jury', () => {
  const juryMetrics = calculateOverviewMetrics(sampleStages, sampleJournals, sampleEvidences, 'jury');
  assert.equal(juryMetrics.totalStages, 2);
  assert.equal(juryMetrics.journalCount, 1); // Only verified visible to jury
  assert.equal(juryMetrics.approvedEvidenceCount, 1);
  assert.equal(juryMetrics.verifiedJournalCount, 1);

  const teacherMetrics = calculateOverviewMetrics(sampleStages, sampleJournals, sampleEvidences, 'teacher_thuy_mai');
  assert.equal(teacherMetrics.journalCount, 2); // Teacher sees both verified and draft
});

test('filterJournalsForRole hides draft entries from jury and supports stage/performer filtering', () => {
  const juryList = filterJournalsForRole(sampleJournals, 'jury');
  assert.equal(juryList.length, 1);
  assert.equal(juryList[0].code, 'NK-01');

  const studentListStage2 = filterJournalsForRole(sampleJournals, 'student_khanh_an', {
    stageFilter: 2,
  });
  assert.equal(studentListStage2.length, 1);
  assert.equal(studentListStage2[0].code, 'NK-02');
});

test('filterEvidencesForRole strictly returns only approved evidence for jury', () => {
  const juryEv = filterEvidencesForRole(sampleEvidences, 'jury');
  assert.equal(juryEv.length, 1);
  assert.equal(juryEv[0].id, 'ev-1');

  const teacherEv = filterEvidencesForRole(sampleEvidences, 'teacher_thuy_mai');
  assert.equal(teacherEv.length, 2);
});

test('buildNextJournalRevision increments version and resets verified status to pending_review on edit', () => {
  const verifiedEntry = sampleJournals[0];
  const updated = buildNextJournalRevision(
    verifiedEntry,
    { workDone: 'Nội dung bổ sung thêm chi tiết biên bản' },
    'Vương Đức Anh',
    '18/11/2026 20:00'
  );

  assert.equal(updated.version, 2);
  assert.equal(updated.reviewStatus, 'pending_review');
  assert.equal(updated.code, 'NK-01'); // Immutable code preserved
  assert.equal(updated.revisionHistory.length, 2);
});

test('generateAppendixVIIIExportMarkdown includes all verified journal fields in table format', () => {
  const md = generateAppendixVIIIExportMarkdown(sampleJournals, []);
  assert.ok(md.includes('PHỤ LỤC VIII'));
  assert.ok(md.includes('01/8/2026'));
  assert.ok(md.includes('Xác nhận T8'));
});
