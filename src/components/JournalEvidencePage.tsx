import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Upload,
  FileText,
  ExternalLink,
  Maximize2,
  X,
  Edit3,
  History,
  Check,
  Search,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import {
  DataOriginType,
  DateCertainty,
  EvidenceItem,
  EvidenceType,
  JournalEntry,
  ReviewStatus,
} from '../types/research';
import {
  filterEvidencesForRole,
  filterJournalsForRole,
} from '../utils/researchLogic';

interface JournalEvidencePageProps {
  initialStageFilter?: number | 'all';
}

type JournalViewMode = 'timeline' | 'by_stage' | 'by_performer';

export const JournalEvidencePage: React.FC<JournalEvidencePageProps> = ({
  initialStageFilter = 'all',
}) => {
  const {
    journals,
    evidences,
    stages,
    activeRole,
    user,
    createJournalEntry,
    updateJournalEntry,
    verifyJournalEntryAsTeacher,
    uploadEvidenceFile,
    toggleEvidenceApprovalAsTeacher,
  } = useResearch();

  const [viewMode, setViewMode] = useState<JournalViewMode>('timeline');
  const [stageFilter, setStageFilter] = useState<number | 'all'>(
    initialStageFilter
  );
  const [performerFilter, setPerformerFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(
    null
  );
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceItem | null>(
    null
  );

  // Forms state
  const [showJournalForm, setShowJournalForm] = useState<boolean>(false);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState<boolean>(false);

  // Teacher review state
  const [teacherCommentInput, setTeacherCommentInput] = useState<string>('');
  const [teacherNoteInput, setTeacherNoteInput] = useState<string>('');
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Create / Edit Journal fields
  const nextAutoCode = `NK-${String(journals.length + 1).padStart(2, '0')}`;
  const [formStageNumber, setFormStageNumber] = useState<number>(1);
  const [formActivityName, setFormActivityName] = useState<string>('');
  const [formActualDate, setFormActualDate] = useState<string>('');
  const [formDateCertainty, setFormDateCertainty] =
    useState<DateCertainty>('range_verified');
  const [formDataOrigin, setFormDataOrigin] = useState<DataOriginType>(
    'retrospective_reconstruction'
  );
  const [formLocation, setFormLocation] = useState<string>(
    'Trường THPT Chuyên Bắc Kạn'
  );
  const [formPerformer, setFormPerformer] = useState<string>(
    activeRole === 'student_khanh_an'
      ? 'Đàm Khánh An'
      : 'Vương Đức Anh'
  );
  const [formCollaborators, setFormCollaborators] =
    useState<string>('GV Vũ Thúy Mai');
  const [formObjective, setFormObjective] = useState<string>('');
  const [formWorkDone, setFormWorkDone] = useState<string>('');
  const [formMethod, setFormMethod] = useState<string>('');
  const [formActualResult, setFormActualResult] = useState<string>('');
  const [formDifficulties, setFormDifficulties] = useState<string>('');
  const [formSolutions, setFormSolutions] = useState<string>('');
  const [formLessonsLearned, setFormLessonsLearned] = useState<string>('');
  const [formNextSteps, setFormNextSteps] = useState<string>('');
  const [formEvidenceSummary, setFormEvidenceSummary] = useState<string>('');
  const [formReviewStatus, setFormReviewStatus] =
    useState<ReviewStatus>('pending_review');

  // Upload Evidence fields
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploadType, setUploadType] = useState<EvidenceType>('image');
  const [uploadProvider, setUploadProvider] = useState<string>('Vương Đức Anh');
  const [uploadCollectionDate, setUploadCollectionDate] =
    useState<string>('18/11/2026');
  const [uploadJournalCode, setUploadJournalCode] = useState<string>('NK-07');
  const [uploadStageNumber, setUploadStageNumber] = useState<number>(3);
  const [uploadManualUrl, setUploadManualUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const canWrite =
    activeRole === 'student_duc_anh' ||
    activeRole === 'student_khanh_an' ||
    activeRole === 'teacher_thuy_mai';

  const isTeacher = activeRole === 'teacher_thuy_mai';

  const filteredJournals = filterJournalsForRole(journals, activeRole, {
    stageFilter,
    performerFilter,
    searchQuery,
  });

  const visibleEvidences = filterEvidencesForRole(
    evidences,
    activeRole,
    stageFilter
  );

  const openCreateJournalModal = () => {
    setEditingJournalId(null);
    setFormStageNumber(1);
    setFormActivityName('');
    setFormActualDate('');
    setFormDateCertainty('range_verified');
    setFormDataOrigin('retrospective_reconstruction');
    setFormLocation('Trường THPT Chuyên Bắc Kạn');
    setFormPerformer(
      activeRole === 'student_khanh_an' ? 'Đàm Khánh An' : 'Vương Đức Anh'
    );
    setFormCollaborators('GV Vũ Thúy Mai');
    setFormObjective('');
    setFormWorkDone('');
    setFormMethod('');
    setFormActualResult('');
    setFormDifficulties('');
    setFormSolutions('');
    setFormLessonsLearned('');
    setFormNextSteps('');
    setFormEvidenceSummary('');
    setFormReviewStatus('pending_review');
    setShowJournalForm(true);
    setFeedbackBanner(null);
  };

  const openEditJournalModal = (entry: JournalEntry) => {
    setEditingJournalId(entry.id);
    setFormStageNumber(entry.stageNumber);
    setFormActivityName(entry.activityName);
    setFormActualDate(entry.actualDateOrRange);
    setFormDateCertainty(entry.dateCertainty);
    setFormDataOrigin(entry.dataOriginType);
    setFormLocation(entry.location);
    setFormPerformer(entry.performer);
    setFormCollaborators(entry.collaborators);
    setFormObjective(entry.objective);
    setFormWorkDone(entry.workDone);
    setFormMethod(entry.method);
    setFormActualResult(entry.actualResult);
    setFormDifficulties(entry.difficulties);
    setFormSolutions(entry.solutions);
    setFormLessonsLearned(entry.lessonsLearned);
    setFormNextSteps(entry.nextSteps);
    setFormEvidenceSummary(entry.evidenceSummary);
    setFormReviewStatus(entry.reviewStatus);
    setShowJournalForm(true);
    setFeedbackBanner(null);
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formActivityName.trim() || !formActualDate.trim() || !formWorkDone.trim()) {
      setFeedbackBanner({
        type: 'error',
        text: 'Vui lòng điền đầy đủ Tên hoạt động, Ngày/khoảng thời gian thực hiện và Nội dung công việc.',
      });
      return;
    }

    if (!user) {
      setFeedbackBanner({
        type: 'error',
        text: 'Chưa ghi dữ liệu: Bạn cần đăng nhập Firebase Authentication (nút Đăng nhập Google trên thanh công cụ) để lưu nhật ký thật vào Firestore.',
      });
      return;
    }

    try {
      if (editingJournalId) {
        await updateJournalEntry(editingJournalId, {
          stageNumber: formStageNumber,
          activityName: formActivityName,
          actualDateOrRange: formActualDate,
          dateCertainty: formDateCertainty,
          dataOriginType: formDataOrigin,
          location: formLocation,
          performer: formPerformer,
          collaborators: formCollaborators,
          objective: formObjective,
          workDone: formWorkDone,
          method: formMethod,
          actualResult: formActualResult,
          difficulties: formDifficulties,
          solutions: formSolutions,
          lessonsLearned: formLessonsLearned,
          nextSteps: formNextSteps,
          evidenceSummary: formEvidenceSummary,
          reviewStatus: formReviewStatus,
        });
        setFeedbackBanner({
          type: 'success',
          text: 'Đã lưu phiên bản cập nhật nhật ký vào Firestore và ghi nhận lịch sử chỉnh sửa.',
        });
      } else {
        await createJournalEntry({
          code: nextAutoCode,
          orderIndex: journals.length + 1,
          stageNumber: formStageNumber,
          activityName: formActivityName,
          actualDateOrRange: formActualDate,
          dateCertainty: formDateCertainty,
          dataOriginType: formDataOrigin,
          location: formLocation,
          performer: formPerformer,
          collaborators: formCollaborators,
          objective: formObjective,
          workDone: formWorkDone,
          method: formMethod,
          actualResult: formActualResult,
          difficulties: formDifficulties,
          solutions: formSolutions,
          lessonsLearned: formLessonsLearned,
          nextSteps: formNextSteps,
          evidenceSummary: formEvidenceSummary,
          reviewStatus: formReviewStatus,
          teacherComment: '',
          teacherConfirmationNote: '',
          verifiedAt: '',
        });
        setFeedbackBanner({
          type: 'success',
          text: `Đã tạo bản ghi nhật ký mới (${nextAutoCode}) trên cơ sở dữ liệu Firestore.`,
        });
      }
      setShowJournalForm(false);
    } catch (err) {
      setFeedbackBanner({
        type: 'error',
        text: `Không thể lưu nhật ký: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  const handleTeacherDecision = async (
    entry: JournalEntry,
    decision: 'verified' | 'revision_requested'
  ) => {
    if (!user) {
      setFeedbackBanner({
        type: 'error',
        text: 'Vui lòng đăng nhập tài khoản Google của Giáo viên hướng dẫn để xác nhận vào Firestore.',
      });
      return;
    }
    try {
      await verifyJournalEntryAsTeacher(
        entry.id,
        decision,
        teacherCommentInput || entry.teacherComment,
        teacherNoteInput || entry.teacherConfirmationNote || 'GVHD Vũ Thúy Mai xác nhận'
      );
      setFeedbackBanner({
        type: 'success',
        text:
          decision === 'verified'
            ? `Đã xác nhận bản ghi ${entry.code} trên hệ thống.`
            : `Đã gửi yêu cầu bổ sung/chỉnh sửa cho bản ghi ${entry.code}.`,
      });
      setSelectedJournal(null);
    } catch (err) {
      setFeedbackBanner({
        type: 'error',
        text: `Lỗi xác nhận: ${err instanceof Error ? err.message : String(err)}`,
      });
    }
  };

  const handleUploadEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDescription.trim()) {
      setFeedbackBanner({
        type: 'error',
        text: 'Vui lòng nhập mô tả chi tiết cho minh chứng.',
      });
      return;
    }
    if (uploadFiles.length === 0 && !uploadManualUrl.trim() && !uploadTitle.trim()) {
      setFeedbackBanner({
        type: 'error',
        text: 'Vui lòng chọn ít nhất 1 tệp để tải lên hoặc nhập tên tệp và đường dẫn minh chứng.',
      });
      return;
    }
    if (!user) {
      setFeedbackBanner({
        type: 'error',
        text: 'Chưa tải lên: Cần đăng nhập Firebase Authentication để tải tệp minh chứng lên Cloud Storage và lưu metadata vào Firestore.',
      });
      return;
    }

    try {
      setUploadProgress(5);
      if (uploadFiles.length > 0) {
        for (let i = 0; i < uploadFiles.length; i++) {
          const f = uploadFiles[i];
          await uploadEvidenceFile(
            f,
            {
              fileName: uploadFiles.length === 1 && uploadTitle.trim() ? uploadTitle.trim() : f.name,
              description: uploadDescription,
              evidenceType: uploadType,
              providerName: uploadProvider,
              collectionDate: uploadCollectionDate,
              journalCode: uploadJournalCode,
              stageNumber: uploadStageNumber,
              manualStorageUrl: uploadManualUrl,
            },
            (pct) => {
              const overall = Math.round(((i + pct / 100) / uploadFiles.length) * 100);
              setUploadProgress(overall);
            }
          );
        }
      } else {
        await uploadEvidenceFile(
          null,
          {
            fileName: uploadTitle.trim(),
            description: uploadDescription,
            evidenceType: uploadType,
            providerName: uploadProvider,
            collectionDate: uploadCollectionDate,
            journalCode: uploadJournalCode,
            stageNumber: uploadStageNumber,
            manualStorageUrl: uploadManualUrl,
          },
          (pct) => setUploadProgress(pct)
        );
      }

      setFeedbackBanner({
        type: 'success',
        text: 'Tải minh chứng và ghi nhận metadata vào Firestore thành công.',
      });
      setUploadProgress(null);
      setShowUploadForm(false);
      setUploadFiles([]);
      setUploadTitle('');
      setUploadDescription('');
      setUploadManualUrl('');
    } catch (err) {
      setUploadProgress(null);
      setFeedbackBanner({
        type: 'error',
        text: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const getCertaintyLabel = (c: DateCertainty) => {
    if (c === 'exact') return 'Ngày chính xác tuyệt đối';
    if (c === 'range_verified') return 'Khoảng thời gian đã đối chiếu biên bản';
    return 'Ước lượng hồi cứu có căn cứ';
  };

  const getOriginLabel = (o: DataOriginType) => {
    if (o === 'original_record') return 'Dữ liệu gốc lưu trữ';
    if (o === 'retrospective_reconstruction') return 'Nội dung hồi cứu tổng hợp';
    return 'Nội dung phân tích – suy luận';
  };

  const getReviewBadge = (status: ReviewStatus, note?: string) => {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {note ? `GVHD đã xác nhận (${note})` : 'GVHD đã xác nhận'}
        </span>
      );
    }
    if (status === 'pending_review') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-800">
          <Clock className="w-3.5 h-3.5" />
          Chờ GVHD xác nhận
        </span>
      );
    }
    if (status === 'revision_requested') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700">
          <AlertCircle className="w-3.5 h-3.5" />
          GVHD yêu cầu chỉnh sửa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-600">
        Bản nháp học sinh
      </span>
    );
  };

  const renderJournalCard = (entry: JournalEntry) => {
    const linkedEvidences = visibleEvidences.filter(
      (ev) => ev.journalCode === entry.code
    );

    return (
      <article
        key={entry.id}
        className="bg-white border border-slate-200 p-6 transition-colors hover:border-slate-300"
      >
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono-num font-bold text-[#1E3A8A]">
                {entry.code} (TT {String(entry.orderIndex).padStart(2, '0')})
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num font-semibold text-slate-800">
                Thực hiện: {entry.actualDateOrRange}
              </span>
              <span aria-hidden="true">·</span>
              <span>Giai đoạn {entry.stageNumber}</span>
              <span aria-hidden="true">·</span>
              <span>{getOriginLabel(entry.dataOriginType)}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-num">Phiên bản v{entry.version}</span>
            </div>

            <h3 className="text-lg font-semibold text-slate-900">
              {entry.activityName}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span>
                <strong>Người thực hiện:</strong> {entry.performer}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>Phối hợp:</strong> {entry.collaborators}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>Địa điểm:</strong> {entry.location}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {getReviewBadge(entry.reviewStatus, entry.teacherConfirmationNote)}

            <button
              onClick={() => {
                setSelectedJournal(entry);
                setTeacherCommentInput(entry.teacherComment);
                setTeacherNoteInput(
                  entry.teacherConfirmationNote || 'GVHD xác nhận'
                );
              }}
              aria-label={`Xem hồ sơ chi tiết ${entry.code}`}
              className="px-3.5 py-1.5 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 whitespace-nowrap"
            >
              Xem hồ sơ chi tiết
            </button>

            {canWrite && (
              <button
                onClick={() => openEditJournalModal(entry)}
                aria-label={`Chỉnh sửa nhật ký ${entry.code}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5" />
                {entry.reviewStatus === 'verified'
                  ? 'Bổ sung (Tạo v' + (entry.version + 1) + ')'
                  : 'Chỉnh sửa'}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-slate-700 leading-relaxed">
          <div>
            <div className="font-semibold text-slate-900 mb-1">
              Nội dung công việc đã thực hiện
            </div>
            <p>{entry.workDone}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">
              Kết quả thực tế đạt được
            </div>
            <p>{entry.actualResult}</p>
          </div>
          <div>
            <div className="font-semibold text-slate-900 mb-1">
              Minh chứng ghi nhận (Phụ lục VIII)
            </div>
            <p className="mb-2">{entry.evidenceSummary}</p>
            {linkedEvidences.length > 0 && (
              <div className="space-y-1">
                {linkedEvidences.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => setPreviewEvidence(ev)}
                    className="block text-left text-[#1E3A8A] font-medium hover:underline truncate max-w-full"
                  >
                    → Tệp: {ev.fileName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header & Role Action Toolbar */}
      <section className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-[#1E3A8A] mb-1">
              PHỤ LỤC VIII · NHẬT KÝ NGHIÊN CỨU VÀ MINH CHỨNG DỮ LIỆU
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
              Nhật ký thực hiện và Kho minh chứng xác thực
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Số hóa toàn bộ 16 mục nhật ký từ ngày 01/8/2026 đến 18/11/2026. Giữ nguyên ngày tạo hệ thống, phân biệt rõ dữ liệu gốc – nội dung hồi cứu – nội dung suy luận. Mọi chỉnh sửa sau khi GVHD xác nhận đều tự động tạo phiên bản mới (v2, v3...) kèm lịch sử kiểm toán.
            </p>
          </div>

          {canWrite && (
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={openCreateJournalModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#0F172A] hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Tạo bản ghi nhật ký mới
              </button>
              <button
                onClick={() => {
                  setShowUploadForm(true);
                  setFeedbackBanner(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A] bg-white hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                <Upload className="w-4 h-4" />
                Tải tệp minh chứng lên
              </button>
            </div>
          )}
        </div>

        {feedbackBanner && (
          <div
            role="status"
            className={`mt-5 p-4 border text-xs leading-relaxed ${
              feedbackBanner.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {feedbackBanner.text}
          </div>
        )}

        {/* Filter & View Mode Bar */}
        <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 3 View Modes required by Section V.4 */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 w-fit">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === 'timeline'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chế độ: Dòng thời gian (Mặc định)
            </button>
            <button
              onClick={() => setViewMode('by_stage')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === 'by_stage'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách theo giai đoạn
            </button>
            <button
              onClick={() => setViewMode('by_performer')}
              className={`px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === 'by_performer'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Danh sách theo người thực hiện
            </button>
          </div>

          {/* Search & Stage Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Tìm kiếm nhật ký"
                placeholder="Tìm mã NK, nội dung, kết quả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 bg-white w-56 focus:outline-none focus:border-[#1E3A8A]"
              />
            </div>

            <select
              aria-label="Lọc theo giai đoạn"
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(
                  e.target.value === 'all' ? 'all' : Number(e.target.value)
                )
              }
              className="text-xs border border-slate-300 bg-white px-3 py-1.5"
            >
              <option value="all">Tất cả 6 giai đoạn</option>
              {stages.map((st) => (
                <option key={st.id} value={st.stageNumber}>
                  Giai đoạn {st.stageNumber}
                </option>
              ))}
            </select>

            <select
              aria-label="Lọc theo người thực hiện"
              value={performerFilter}
              onChange={(e) => setPerformerFilter(e.target.value)}
              className="text-xs border border-slate-300 bg-white px-3 py-1.5"
            >
              <option value="all">Tất cả thành viên</option>
              <option value="Vương Đức Anh">Vương Đức Anh</option>
              <option value="Đàm Khánh An">Đàm Khánh An</option>
              <option value="Cả nhóm">Cả nhóm</option>
            </select>
          </div>
        </div>
      </section>

      {/* JOURNAL LISTING BY VIEW MODE */}
      {viewMode === 'timeline' && (
        <section aria-label="Dòng thời gian nhật ký" className="space-y-4">
          {filteredJournals.map((entry) => renderJournalCard(entry))}
        </section>
      )}

      {viewMode === 'by_stage' && (
        <section aria-label="Nhật ký theo giai đoạn" className="space-y-8">
          {stages.map((st) => {
            const stageEntries = filteredJournals.filter(
              (j) => j.stageNumber === st.stageNumber
            );
            if (stageEntries.length === 0) return null;
            return (
              <div key={st.id} className="space-y-4">
                <div className="border-b border-slate-300 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {st.title} ({st.period})
                  </h2>
                  <span className="text-xs font-mono-num text-slate-600">
                    {stageEntries.length} bản ghi
                  </span>
                </div>
                <div className="space-y-4">
                  {stageEntries.map((entry) => renderJournalCard(entry))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {viewMode === 'by_performer' && (
        <section aria-label="Nhật ký theo người thực hiện" className="space-y-8">
          {[
            {
              key: 'Vương Đức Anh',
              label:
                '1. Vương Đức Anh – Lớp 12 Hóa Sinh (Trưởng nhóm · Phụ trách giải pháp kỹ thuật & chế tạo trạm RESET-AI)',
              matcher: (j: JournalEntry) =>
                j.performer.includes('Vương Đức Anh') ||
                j.performer.includes('Cả nhóm'),
            },
            {
              key: 'Đàm Khánh An',
              label:
                '2. Đàm Khánh An – Lớp 11 Hóa (Thành viên · Phụ trách cơ sở khoa học, công cụ khảo sát, xử lý số liệu & báo cáo)',
              matcher: (j: JournalEntry) =>
                j.performer.includes('Đàm Khánh An') ||
                j.performer.includes('Cả nhóm'),
            },
          ].map((group) => {
            const entries = filteredJournals.filter(group.matcher);
            return (
              <div key={group.key} className="space-y-4">
                <div className="border-b border-slate-300 pb-2 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {group.label}
                  </h2>
                  <span className="text-xs font-mono-num text-slate-600">
                    {entries.length} hoạt động tham gia
                  </span>
                </div>
                <div className="space-y-4">
                  {entries.map((entry) => renderJournalCard(entry))}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* KHO MINH CHỨNG DỮ LIỆU ĐÍNH KÈM */}
      <section aria-labelledby="evidence-vault-heading" className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
          <div>
            <h2 id="evidence-vault-heading" className="text-xl font-semibold text-slate-900">
              Danh mục tệp minh chứng dữ liệu ({visibleEvidences.length})
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Hỗ trợ ảnh JPG/PNG/SVG, PDF, Word, Excel, Video MP4 và mã nguồn ESP32-S3. Giám khảo chỉ nhìn thấy minh chứng đã được GVHD Vũ Thúy Mai duyệt.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleEvidences.map((ev) => (
            <div
              key={ev.id}
              className="border border-slate-200 bg-[#FAF9F6] p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span>
                    <strong className="font-mono-num text-[#1E3A8A]">
                      {ev.journalCode}
                    </strong>{' '}
                    · GĐ {ev.stageNumber} · {ev.collectionDate}
                  </span>
                  <span
                    className={`font-medium ${
                      ev.isApprovedForJury ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                  >
                    {ev.isApprovedForJury ? 'Đã duyệt cho Giám khảo' : 'Chờ GVHD duyệt'}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mb-2 break-words">
                  {ev.fileName}
                </h3>

                {ev.previewDataUrl ? (
                  <div className="mb-3 bg-white border border-slate-200 p-2">
                    <img
                      src={ev.previewDataUrl}
                      alt={ev.description}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-contain"
                    />
                    <button
                      onClick={() => setPreviewEvidence(ev)}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#1E3A8A] bg-slate-50 hover:bg-slate-100 border border-slate-200"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Xem toàn màn hình
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 bg-white border border-slate-200 p-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#1E3A8A] shrink-0" />
                    <div className="text-xs text-slate-600">
                      <div className="font-medium text-slate-800">
                        Loại: {ev.evidenceType.toUpperCase()}
                      </div>
                      <div className="font-mono-num">
                        Kích thước: {Math.round(ev.fileSize / 1024)} KB
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {ev.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Cung cấp: {ev.providerName}</span>
                  {ev.storageUrl ? (
                    <a
                      href={ev.storageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#1E3A8A] hover:underline"
                    >
                      <span>Mở tệp</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      onClick={() => setPreviewEvidence(ev)}
                      className="font-semibold text-[#1E3A8A] hover:underline"
                    >
                      Xem chi tiết
                    </button>
                  )}
                </div>

                {isTeacher && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        toggleEvidenceApprovalAsTeacher(
                          ev.id,
                          !ev.isApprovedForJury,
                          ev.isFeatured
                        )
                      }
                      className={`w-full py-1.5 px-2 text-xs font-medium border transition-colors ${
                        ev.isApprovedForJury
                          ? 'border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                          : 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
                      }`}
                    >
                      {ev.isApprovedForJury
                        ? 'Thu hồi hiển thị Giám khảo'
                        : 'Duyệt hiển thị cho Giám khảo'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL CHI TIẾT NHẬT KÝ ĐẦY ĐỦ 20 TRƯỜNG & XÁC NHẬN CỦA GVHD */}
      {selectedJournal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết nhật ký ${selectedJournal.code}`}
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Mã tự động: <strong className="font-mono-num text-[#1E3A8A]">{selectedJournal.code}</strong> · Giai đoạn {selectedJournal.stageNumber} · Phiên bản v{selectedJournal.version}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedJournal.activityName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                aria-label="Đóng chi tiết nhật ký"
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF9F6] border border-slate-200 p-4 text-xs text-slate-700 mb-6">
              <div>
                <strong>Thời gian thực hiện thực tế:</strong>{' '}
                <span className="font-mono-num">{selectedJournal.actualDateOrRange}</span>
              </div>
              <div>
                <strong>Mức độ chắc chắn về thời gian:</strong>{' '}
                {getCertaintyLabel(selectedJournal.dateCertainty)}
              </div>
              <div>
                <strong>Phân loại nguồn dữ liệu:</strong>{' '}
                {getOriginLabel(selectedJournal.dataOriginType)}
              </div>
              <div>
                <strong>Ngày nhập hệ thống (Không thể sửa):</strong>{' '}
                <span className="font-mono-num">
                  {selectedJournal.systemEntryDateLabel || '18/11/2026'}
                </span>
              </div>
              <div>
                <strong>Địa điểm thực hiện:</strong> {selectedJournal.location}
              </div>
              <div>
                <strong>Người thực hiện:</strong> {selectedJournal.performer}
              </div>
              <div>
                <strong>Người phối hợp:</strong> {selectedJournal.collaborators}
              </div>
              <div>
                <strong>Trạng thái kiểm duyệt:</strong>{' '}
                {selectedJournal.reviewStatus === 'verified'
                  ? `Đã xác nhận (${selectedJournal.teacherConfirmationNote || selectedJournal.verifiedAt})`
                  : 'Chờ GVHD xác nhận'}
              </div>
            </div>

            <div className="space-y-4 text-sm text-slate-800 leading-relaxed">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  1. Mục tiêu hoạt động
                </h3>
                <p className="p-3 bg-slate-50 border border-slate-200">
                  {selectedJournal.objective}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  2. Nội dung công việc đã thực hiện
                </h3>
                <p className="p-3 bg-slate-50 border border-slate-200">
                  {selectedJournal.workDone}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  3. Phương pháp hoặc cách thức thực hiện
                </h3>
                <p className="p-3 bg-slate-50 border border-slate-200">
                  {selectedJournal.method}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  4. Kết quả thực tế
                </h3>
                <p className="p-3 bg-slate-50 border border-slate-200">
                  {selectedJournal.actualResult}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    5. Khó khăn phát sinh
                  </h3>
                  <p className="p-3 bg-slate-50 border border-slate-200 text-xs">
                    {selectedJournal.difficulties}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    6. Cách khắc phục hoặc điều chỉnh
                  </h3>
                  <p className="p-3 bg-slate-50 border border-slate-200 text-xs">
                    {selectedJournal.solutions}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    7. Bài học kinh nghiệm
                  </h3>
                  <p className="p-3 bg-slate-50 border border-slate-200 text-xs">
                    {selectedJournal.lessonsLearned}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    8. Công việc tiếp theo
                  </h3>
                  <p className="p-3 bg-slate-50 border border-slate-200 text-xs">
                    {selectedJournal.nextSteps}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  9. Minh chứng đính kèm & Nhận xét của Giáo viên hướng dẫn
                </h3>
                <div className="p-4 bg-[#FAF9F6] border border-slate-200 text-xs space-y-1.5">
                  <div>
                    <strong>Minh chứng:</strong> {selectedJournal.evidenceSummary}
                  </div>
                  <div>
                    <strong>Nhận xét của GVHD Vũ Thúy Mai:</strong>{' '}
                    {selectedJournal.teacherComment || 'Chưa có nhận xét'}
                  </div>
                  <div>
                    <strong>Ký xác nhận & Ngày xác nhận:</strong>{' '}
                    {selectedJournal.teacherConfirmationNote || '—'} ({selectedJournal.verifiedAt || '—'})
                  </div>
                </div>
              </div>

              {/* Lịch sử phiên bản & tính trung thực */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Lịch sử phiên bản và kiểm toán tính trung thực
                </h3>
                <ul className="p-3 bg-slate-50 border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                  {selectedJournal.revisionHistory.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Khu vực dành riêng cho Giáo viên Vũ Thúy Mai duyệt */}
              {isTeacher && (
                <div className="mt-6 pt-6 border-t border-slate-300 bg-slate-50 p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-[#1E3A8A]">
                    Thẩm định và Xác nhận của Giáo viên hướng dẫn (Vũ Thúy Mai)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Nhận xét chuyên môn của GVHD
                      </label>
                      <input
                        type="text"
                        value={teacherCommentInput}
                        onChange={(e) => setTeacherCommentInput(e.target.value)}
                        placeholder="Nhập nhận xét cho học sinh..."
                        className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Ghi chú ký xác nhận (VD: Xác nhận T8, T9, T10, T11)
                      </label>
                      <input
                        type="text"
                        value={teacherNoteInput}
                        onChange={(e) => setTeacherNoteInput(e.target.value)}
                        placeholder="Xác nhận T11"
                        className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        handleTeacherDecision(selectedJournal, 'verified')
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Xác nhận chính thức nhật ký này
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleTeacherDecision(
                          selectedJournal,
                          'revision_requested'
                        )
                      }
                      className="px-4 py-2 border border-red-300 bg-red-50 text-red-800 text-xs font-medium hover:bg-red-100"
                    >
                      Yêu cầu học sinh bổ sung / chỉnh sửa
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO / CHỈNH SỬA NHẬT KÝ (ĐẦY ĐỦ CÁC TRƯỜNG MỤC V.1) */}
      {showJournalForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Biểu mẫu nhật ký nghiên cứu"
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveJournal}
            className="bg-white border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 space-y-5"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {editingJournalId
                    ? 'Cập nhật / Bổ sung Nhật ký Nghiên cứu (Tự động lưu phiên bản mới)'
                    : `Tạo bản ghi Nhật ký Nghiên cứu mới (Mã tự động: ${nextAutoCode})`}
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Ngày tạo hệ thống được khóa tự động bằng Server Timestamp. Nếu chỉ xác định được khoảng thời gian thực hiện, hãy chọn rõ mức độ chắc chắn.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowJournalForm(false)}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Giai đoạn nghiên cứu *
                </label>
                <select
                  value={formStageNumber}
                  onChange={(e) => setFormStageNumber(Number(e.target.value))}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  {stages.map((st) => (
                    <option key={st.id} value={st.stageNumber}>
                      Giai đoạn {st.stageNumber}: {st.title.slice(0, 42)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ngày hoặc khoảng thời gian thực tế *
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 16/9 – 30/9/2026"
                  value={formActualDate}
                  onChange={(e) => setFormActualDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mức độ chắc chắn về thời gian *
                </label>
                <select
                  value={formDateCertainty}
                  onChange={(e) =>
                    setFormDateCertainty(e.target.value as DateCertainty)
                  }
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="exact">Ngày chính xác tuyệt đối</option>
                  <option value="range_verified">
                    Khoảng thời gian đã xác minh qua biên bản
                  </option>
                  <option value="retrospective_estimate">
                    Khoảng thời gian hồi cứu ước lượng
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên hoạt động nghiên cứu *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên hoạt động cụ thể..."
                  value={formActivityName}
                  onChange={(e) => setFormActivityName(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phân loại tính chất dữ liệu (Mục V.3) *
                </label>
                <select
                  value={formDataOrigin}
                  onChange={(e) =>
                    setFormDataOrigin(e.target.value as DataOriginType)
                  }
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="original_record">
                    Dữ liệu gốc (Có biên bản/file log tại thời điểm thực hiện)
                  </option>
                  <option value="retrospective_reconstruction">
                    Nội dung hồi cứu tổng hợp từ quá trình đã thực hiện
                  </option>
                  <option value="analytical_inference">
                    Nội dung suy luận / phân tích bổ sung
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Địa điểm thực hiện *
                </label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Người thực hiện chính *
                </label>
                <input
                  type="text"
                  required
                  value={formPerformer}
                  onChange={(e) => setFormPerformer(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Người phối hợp
                </label>
                <input
                  type="text"
                  value={formCollaborators}
                  onChange={(e) => setFormCollaborators(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Mục tiêu hoạt động
                </label>
                <textarea
                  rows={2}
                  value={formObjective}
                  onChange={(e) => setFormObjective(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phương pháp / Cách thức thực hiện
                </label>
                <textarea
                  rows={2}
                  value={formMethod}
                  onChange={(e) => setFormMethod(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nội dung công việc đã thực hiện *
              </label>
              <textarea
                rows={3}
                required
                value={formWorkDone}
                onChange={(e) => setFormWorkDone(e.target.value)}
                className="w-full text-xs border border-slate-300 bg-white p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Kết quả thực tế đạt được
                </label>
                <textarea
                  rows={2}
                  value={formActualResult}
                  onChange={(e) => setFormActualResult(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tóm tắt minh chứng đính kèm
                </label>
                <textarea
                  rows={2}
                  value={formEvidenceSummary}
                  onChange={(e) => setFormEvidenceSummary(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Khó khăn phát sinh
                </label>
                <textarea
                  rows={2}
                  value={formDifficulties}
                  onChange={(e) => setFormDifficulties(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cách khắc phục hoặc điều chỉnh
                </label>
                <textarea
                  rows={2}
                  value={formSolutions}
                  onChange={(e) => setFormSolutions(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Bài học kinh nghiệm
                </label>
                <textarea
                  rows={2}
                  value={formLessonsLearned}
                  onChange={(e) => setFormLessonsLearned(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Công việc tiếp theo
                </label>
                <textarea
                  rows={2}
                  value={formNextSteps}
                  onChange={(e) => setFormNextSteps(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white p-2.5"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-700">
                  Trạng thái gửi:
                </label>
                <select
                  value={formReviewStatus}
                  onChange={(e) =>
                    setFormReviewStatus(e.target.value as ReviewStatus)
                  }
                  className="text-xs border border-slate-300 bg-white px-3 py-1.5"
                >
                  <option value="draft">Lưu bản nháp cá nhân</option>
                  <option value="pending_review">Gửi GVHD Vũ Thúy Mai xác nhận</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowJournalForm(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-slate-800"
                >
                  Lưu nhật ký vào Firestore
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* MODAL TẢI TỆP MINH CHỨNG LÊN FIREBASE STORAGE & FIRESTORE */}
      {showUploadForm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tải tệp minh chứng lên hệ thống"
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleUploadEvidenceSubmit}
            className="bg-white border border-slate-200 max-w-2xl w-full p-6 lg:p-8 space-y-4"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Tải minh chứng nghiên cứu lên hệ thống
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Hỗ trợ Ảnh (JPG, PNG, SVG), PDF, Word, Excel, Video MP4 và Mã nguồn kỹ thuật. Cho phép chọn nhiều tệp cùng lúc cho một hoạt động.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Chọn tệp từ thiết bị (Có thể chọn nhiều tệp)
              </label>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.svg,.pdf,.doc,.docx,.xls,.xlsx,.mp4,.ino,.cpp,.c,.h,.txt,.md,.csv"
                onChange={(e) =>
                  setUploadFiles(e.target.files ? Array.from(e.target.files) : [])
                }
                className="w-full text-xs border border-slate-300 bg-slate-50 p-2.5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên tệp hiển thị (Nếu đặt tên riêng)
                </label>
                <input
                  type="text"
                  placeholder="VD: Anh_lap_rap_ESP32_S3.jpg"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Loại minh chứng *
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as EvidenceType)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="image">Hình ảnh / Sơ đồ kỹ thuật (JPG, PNG, SVG)</option>
                  <option value="pdf">Tài liệu PDF / Biên bản</option>
                  <option value="word">Tài liệu Word (.docx)</option>
                  <option value="excel">Bảng tính Excel / Dữ liệu (.xlsx)</option>
                  <option value="video">Video thử nghiệm (.mp4)</option>
                  <option value="source_code">Mã nguồn ESP32-S3 / Tài liệu kỹ thuật</option>
                  <option value="survey_dataset">Dữ liệu khảo sát Google Form</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Liên kết đến Mã nhật ký *
                </label>
                <select
                  value={uploadJournalCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setUploadJournalCode(code);
                    const matched = journals.find((j) => j.code === code);
                    if (matched) setUploadStageNumber(matched.stageNumber);
                  }}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  {journals.map((j) => (
                    <option key={j.id} value={j.code}>
                      {j.code} - {j.activityName.slice(0, 32)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Người cung cấp *
                </label>
                <input
                  type="text"
                  required
                  value={uploadProvider}
                  onChange={(e) => setUploadProvider(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Ngày tạo / thu thập
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: 30/9/2026"
                  value={uploadCollectionDate}
                  onChange={(e) => setUploadCollectionDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Mô tả chi tiết nội dung và giá trị kiểm chứng của minh chứng *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Ghi rõ minh chứng này chứng minh cho hoạt động nào, kết quả gì..."
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full text-xs border border-slate-300 bg-white p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Liên kết Google Drive dự án / URL lưu trữ ngoài (Tùy chọn nếu tệp lớn)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={uploadManualUrl}
                onChange={(e) => setUploadManualUrl(e.target.value)}
                className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            {uploadProgress !== null && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono-num text-slate-700">
                  <span>Đang tải tệp và ghi metadata...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200">
                  <div
                    className="h-2 bg-[#1E3A8A] transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowUploadForm(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={uploadProgress !== null}
                className="px-5 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-slate-800 disabled:opacity-50"
              >
                Tải lên & Lưu vào Firestore
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL XEM TRƯỚC MINH CHỨNG TOÀN MÀN HÌNH */}
      {previewEvidence && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Xem minh chứng ${previewEvidence.fileName}`}
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Mã nhật ký liên kết: <strong className="text-[#1E3A8A]">{previewEvidence.journalCode}</strong> · Giai đoạn {previewEvidence.stageNumber} · Thu thập: {previewEvidence.collectionDate}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {previewEvidence.fileName}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEvidence(null)}
                aria-label="Đóng cửa sổ"
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {previewEvidence.previewDataUrl && (
              <div className="bg-slate-50 border border-slate-200 p-4 mb-6 flex justify-center">
                <img
                  src={previewEvidence.previewDataUrl}
                  alt={previewEvidence.description}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            )}

            <div className="space-y-2.5 text-sm text-slate-700">
              <p>
                <strong>Mô tả chi tiết:</strong> {previewEvidence.description}
              </p>
              <p>
                <strong>Người cung cấp:</strong> {previewEvidence.providerName}
              </p>
              <p>
                <strong>Trạng thái kiểm duyệt:</strong>{' '}
                {previewEvidence.isApprovedForJury
                  ? 'Đã được GVHD Vũ Thúy Mai phê duyệt hiển thị cho Giám khảo'
                  : 'Đang chờ GVHD phê duyệt'}
              </p>
              {previewEvidence.storageUrl && (
                <div className="pt-4">
                  <a
                    href={previewEvidence.storageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-medium hover:bg-slate-800"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Mở tệp minh chứng gốc
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
