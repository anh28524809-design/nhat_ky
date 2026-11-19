import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  FileText,
  ExternalLink,
  Maximize2,
  X,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { PROJECT_METADATA } from '../data/initialResearchData';
import {
  calculateOverviewMetrics,
  filterEvidencesForRole,
} from '../utils/researchLogic';
import { EvidenceItem } from '../types/research';

interface OverviewPageProps {
  onNavigateTab: (tab: 'overview' | 'timeline' | 'journal' | 'results' | 'dossier', stageNumber?: number) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateTab }) => {
  const { stages, journals, evidences, activeRole } = useResearch();
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<EvidenceItem | null>(null);

  const metrics = calculateOverviewMetrics(stages, journals, evidences, activeRole);
  const approvedEvidences = filterEvidencesForRole(evidences, 'jury').slice(0, 6);

  const getStageStatusText = (status: string) => {
    if (status === 'verified') return 'Đã được GVHD xác nhận';
    if (status === 'completed') return 'Đã hoàn thành';
    return 'Đang thực hiện';
  };

  return (
    <div className="space-y-12 pb-16">
      {/* A. THÔNG TIN DỰ ÁN */}
      <section aria-labelledby="project-info-heading" className="bg-white border border-slate-200 p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
          <span className="font-semibold text-[#1E3A8A]">KẾ HOẠCH SỐ 5999/KH-SGDĐT (16/10/2026)</span>
          <span aria-hidden="true">·</span>
          <span>Lĩnh vực: {PROJECT_METADATA.field}</span>
          <span aria-hidden="true">·</span>
          <span>Đơn vị: {PROJECT_METADATA.institution}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-num">Thời gian: {PROJECT_METADATA.executionPeriod}</span>
        </div>

        <h1
          id="project-info-heading"
          className="text-2xl lg:text-4xl font-semibold text-slate-900 leading-tight mb-4"
          style={{ textWrap: 'balance' }}
        >
          {PROJECT_METADATA.title}
        </h1>

        <p className="text-sm text-slate-600 mb-8 max-w-4xl leading-relaxed">
          Tên ghi trong Phụ lục VIII (Hồ sơ dự thi):{' '}
          <span className="font-medium text-slate-800">
            {PROJECT_METADATA.appendixVIIITitle}
          </span>
        </p>

        {/* Tuyên bố tính chất hồ sơ */}
        <div className="bg-[#F8FAFC] border border-slate-200 p-4 mb-8 text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Tính chất hồ sơ khoa học: </strong>
          {PROJECT_METADATA.natureDeclaration}
        </div>

        {/* Grid: Thành viên & Giáo viên hướng dẫn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
          {PROJECT_METADATA.members.map((member) => (
            <div key={member.name} className="space-y-1.5">
              <div className="text-xs text-slate-500">
                {member.role} · {member.className}
              </div>
              <div className="text-base font-semibold text-slate-900">
                {member.name}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {member.responsibility}
              </p>
            </div>
          ))}

          <div className="space-y-1.5">
            <div className="text-xs text-slate-500">
              {PROJECT_METADATA.advisor.role} · {PROJECT_METADATA.advisor.institution}
            </div>
            <div className="text-base font-semibold text-[#1E3A8A]">
              {PROJECT_METADATA.advisor.name}
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {PROJECT_METADATA.advisor.responsibilities}
            </p>
          </div>
        </div>

        {/* Mục tiêu & Câu hỏi nghiên cứu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Mục tiêu nghiên cứu
            </h2>
            <ol className="space-y-2.5 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {PROJECT_METADATA.researchObjectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              Câu hỏi nghiên cứu
            </h2>
            <ol className="space-y-2.5 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
              {PROJECT_METADATA.researchQuestions.map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>
          </div>
        </div>

        {/* Giới thiệu thiết bị RESET-AI và Quy trình 3T */}
        <div className="mt-8 pt-8 border-t border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Giới thiệu thiết bị trạm RESET-AI và Quy trình 3T
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-6 max-w-4xl">
            {PROJECT_METADATA.resetAiAnd3TIntro.deviceSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PROJECT_METADATA.resetAiAnd3TIntro.process3T.map((step) => (
              <div
                key={step.code}
                className="bg-[#FAF9F6] border border-slate-200 p-5"
              >
                <div className="text-xs font-mono-num font-semibold text-[#1E3A8A] mb-1">
                  BƯỚC {step.code}
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {step.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* B. CÁC CHỈ SỐ TỔNG QUAN (TÍNH TỪ DỮ LIỆU THẬT ĐÃ LƯU) */}
      <section aria-labelledby="metrics-heading">
        <div className="flex items-baseline justify-between mb-4">
          <h2 id="metrics-heading" className="text-xl font-semibold text-slate-900">
            Chỉ số tổng quan hồ sơ thực tế
          </h2>
          <span className="text-xs text-slate-500">
            Tính toán trực tiếp từ cơ sở dữ liệu hiện hành
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500 mb-2">
              Số giai đoạn nghiên cứu
            </div>
            <div className="text-3xl font-bold font-mono-num text-slate-900">
              {metrics.totalStages}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Từ hình thành ý tưởng đến hoàn thiện hồ sơ (01/8 – 18/11/2026)
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500 mb-2">
              Số hoạt động có nhật ký
            </div>
            <div className="text-3xl font-bold font-mono-num text-[#1E3A8A]">
              {metrics.journalCount}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Đối chiếu đúng 16 mục hoạt động tại Phụ lục VIII
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500 mb-2">
              Số minh chứng đã được duyệt
            </div>
            <div className="text-3xl font-bold font-mono-num text-slate-900">
              {metrics.approvedEvidenceCount}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Đã được GVHD Vũ Thúy Mai kiểm duyệt hiển thị
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="text-xs text-slate-500 mb-2">
              Số hoạt động GVHD đã xác nhận
            </div>
            <div className="text-3xl font-bold font-mono-num text-emerald-800">
              {metrics.verifiedJournalCount}
            </div>
            <div className="text-xs text-slate-600 mt-2">
              Xác nhận định kỳ T8, T9, T10, T11 theo Phụ lục VIII
            </div>
          </div>
        </div>
      </section>

      {/* C. HÀNH TRÌNH NGHIÊN CỨU (TIMELINE 6 GIAI ĐOẠN - TÓM TẮT & MỞ CHI TIẾT) */}
      <section aria-labelledby="journey-heading" className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 id="journey-heading" className="text-xl font-semibold text-slate-900">
              Hành trình nghiên cứu (6 giai đoạn)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Mặc định hiển thị nội dung tóm tắt để trình chiếu rõ ràng. Nhấn &ldquo;Xem chi tiết&rdquo; để mở danh sách hoạt động và nhật ký liên quan.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('timeline')}
            className="px-4 py-2 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            Mở trang Tiến trình đầy đủ
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {stages.map((stage) => {
            const isExpanded = expandedStageId === stage.id;
            const stageJournals = journals.filter(
              (j) =>
                j.stageNumber === stage.stageNumber &&
                (activeRole !== 'jury' || j.reviewStatus === 'verified')
            );

            return (
              <div key={stage.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono-num font-semibold text-[#1E3A8A]">
                        Giai đoạn 0{stage.stageNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono-num">{stage.period}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {getStageStatusText(stage.status)}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-slate-900">
                      {stage.title}
                    </h3>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {stage.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() =>
                        setExpandedStageId(isExpanded ? null : stage.id)
                      }
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Thu gọn giai đoạn ${stage.stageNumber}`
                          : `Xem chi tiết giai đoạn ${stage.stageNumber}`
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
                    >
                      {isExpanded ? (
                        <>
                          <span>Thu gọn</span>
                          <ChevronUp className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <span>Xem chi tiết</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-[#FAF9F6] p-5 space-y-4">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        Các hoạt động thành phần trong giai đoạn {stage.stageNumber}:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
                        {stage.activities.map((act, idx) => (
                          <li key={idx}>{act}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-600">
                        Có <strong className="font-mono-num text-slate-900">{stageJournals.length}</strong> bản ghi nhật ký đã xác minh thuộc giai đoạn này (Mã:{' '}
                        {stageJournals.map((j) => j.code).join(', ') || 'Chưa có'}).
                      </div>
                      <button
                        onClick={() => onNavigateTab('journal', stage.stageNumber)}
                        className="text-xs font-semibold text-[#1E3A8A] hover:underline whitespace-nowrap"
                      >
                        Tra cứu nhật ký giai đoạn {stage.stageNumber} →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* D. MINH CHỨNG NỔI BẬT (4-6 MINH CHỨNG THỰC ĐÃ DUYỆT) */}
      <section aria-labelledby="featured-evidence-heading" className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 id="featured-evidence-heading" className="text-xl font-semibold text-slate-900">
              Minh chứng dữ liệu nổi bật đã được giáo viên duyệt
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Trích xuất từ hồ sơ thiết bị RESET-AI, kết quả khảo sát Google Form và Phụ lục VIII (Tuyệt đối không sử dụng hình minh họa stock giả).
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('journal')}
            className="px-4 py-2 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            Xem toàn bộ kho minh chứng
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedEvidences.map((ev) => (
            <div
              key={ev.id}
              className="border border-slate-200 bg-[#FAF9F6] flex flex-col justify-between p-5"
            >
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                  <span className="font-mono-num font-semibold text-[#1E3A8A]">
                    {ev.journalCode}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Giai đoạn {ev.stageNumber}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num">{ev.collectionDate}</span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 mb-2 break-words">
                  {ev.fileName}
                </h3>

                {ev.previewDataUrl ? (
                  <div className="mb-3 border border-slate-200 bg-white p-2 relative group">
                    <img
                      src={ev.previewDataUrl}
                      alt={ev.description}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-contain"
                    />
                    <button
                      onClick={() => setPreviewEvidence(ev)}
                      className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-[#1E3A8A] bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Phóng to sơ đồ / biểu đồ toàn màn hình
                    </button>
                  </div>
                ) : (
                  <div className="mb-3 border border-slate-200 bg-white p-4 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-[#1E3A8A] shrink-0" />
                    <div className="text-xs text-slate-600">
                      <div className="font-medium text-slate-800">
                        Tài liệu minh chứng gốc ({ev.evidenceType.toUpperCase()})
                      </div>
                      <div className="font-mono-num">
                        Dung lượng: {Math.round(ev.fileSize / 1024)} KB
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {ev.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Cung cấp: {ev.providerName}</span>
                {ev.storageUrl ? (
                  <a
                    href={ev.storageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-[#1E3A8A] hover:underline"
                  >
                    <span>Mở tệp gốc</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <button
                    onClick={() => setPreviewEvidence(ev)}
                    className="font-semibold text-[#1E3A8A] hover:underline"
                  >
                    Chi tiết minh chứng
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal Xem trước Minh chứng Toàn màn hình */}
      {previewEvidence && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết minh chứng ${previewEvidence.fileName}`}
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
              <div>
                <div className="text-xs text-slate-500 mb-1">
                  Liên kết nhật ký: <strong className="text-[#1E3A8A]">{previewEvidence.journalCode}</strong> · Giai đoạn {previewEvidence.stageNumber} · Ngày thu thập: {previewEvidence.collectionDate}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {previewEvidence.fileName}
                </h3>
              </div>
              <button
                onClick={() => setPreviewEvidence(null)}
                aria-label="Đóng cửa sổ xem minh chứng"
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

            <div className="space-y-3 text-sm text-slate-700">
              <p>
                <strong>Mô tả minh chứng:</strong> {previewEvidence.description}
              </p>
              <p>
                <strong>Người cung cấp:</strong> {previewEvidence.providerName}
              </p>
              <p>
                <strong>Trạng thái kiểm duyệt:</strong> Đã được GVHD Vũ Thúy Mai phê duyệt hiển thị cho Hội đồng giám khảo.
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
                    Tải xuống / Xem văn bản gốc đính kèm
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
