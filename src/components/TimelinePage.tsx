import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Plus,
  Save,
  Trash2,
  Edit3,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { ResearchStage, StageStatus } from '../types/research';

interface TimelinePageProps {
  onSelectStageJournals: (stageNumber: number) => void;
}

export const TimelinePage: React.FC<TimelinePageProps> = ({
  onSelectStageJournals,
}) => {
  const { stages, journals, activeRole, user, saveStage } = useResearch();
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [draftStage, setDraftStage] = useState<ResearchStage | null>(null);
  const [newActivityText, setNewActivityText] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canEditStages =
    activeRole === 'teacher_thuy_mai' ||
    activeRole === 'student_duc_anh' ||
    activeRole === 'student_khanh_an';

  const startEditing = (stage: ResearchStage) => {
    setEditingStageId(stage.id);
    setDraftStage({ ...stage, activities: [...stage.activities] });
    setNewActivityText('');
    setStatusMessage('');
  };

  const cancelEditing = () => {
    setEditingStageId(null);
    setDraftStage(null);
    setNewActivityText('');
  };

  const handleMoveActivity = (index: number, direction: -1 | 1) => {
    if (!draftStage) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= draftStage.activities.length) return;
    const nextActs = [...draftStage.activities];
    const temp = nextActs[index];
    nextActs[index] = nextActs[targetIndex];
    nextActs[targetIndex] = temp;
    setDraftStage({ ...draftStage, activities: nextActs });
  };

  const handleRemoveActivity = (index: number) => {
    if (!draftStage) return;
    const nextActs = draftStage.activities.filter((_, i) => i !== index);
    setDraftStage({ ...draftStage, activities: nextActs });
  };

  const handleAddActivity = () => {
    if (!draftStage || !newActivityText.trim()) return;
    if (draftStage.activities.length >= 20) {
      setStatusMessage('Tối đa 20 hoạt động nhỏ trong mỗi giai đoạn.');
      return;
    }
    setDraftStage({
      ...draftStage,
      activities: [...draftStage.activities, newActivityText.trim()],
    });
    setNewActivityText('');
  };

  const handleSaveStage = async () => {
    if (!draftStage) return;
    if (!user) {
      setStatusMessage(
        'Lưu ý: Bạn chưa đăng nhập Firebase Authentication. Vui lòng bấm "Đăng nhập Google" ở góc trên để lưu thay đổi thực tế vào Firestore.'
      );
      return;
    }
    try {
      await saveStage(draftStage);
      setEditingStageId(null);
      setDraftStage(null);
      setStatusMessage('Đã lưu cập nhật giai đoạn vào cơ sở dữ liệu Firestore.');
    } catch (err) {
      setStatusMessage(
        `Lỗi khi lưu: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  const getStatusLabel = (status: StageStatus) => {
    if (status === 'verified') return 'Đã được GVHD xác nhận';
    if (status === 'completed') return 'Đã hoàn thành thực tế';
    return 'Đang thực hiện';
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#1E3A8A] mb-1">
              TRÌNH TỰ KHOA HỌC 6 GIAI ĐOẠN (01/8/2026 – 18/11/2026)
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
              Tiến trình nghiên cứu dự án RESET-AI
            </h1>
            <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
              Thiết kế theo trục dọc chuẩn học thuật để trình chiếu trên máy chiếu hội đồng. Trạng thái từng giai đoạn chỉ được xác lập dựa trên biên bản nhật ký và xác nhận thực tế của GVHD Vũ Thúy Mai (không tự động đánh dấu hoàn thành theo ngày dự kiến).
            </p>
          </div>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 bg-slate-50 border border-slate-300 text-xs text-slate-800">
            {statusMessage}
          </div>
        )}
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 md:pl-10 border-l border-slate-300 space-y-10 ml-3 md:ml-6">
        {stages.map((stage) => {
          const isEditing = editingStageId === stage.id && draftStage;
          const stageJournals = journals.filter(
            (j) =>
              j.stageNumber === stage.stageNumber &&
              (activeRole !== 'jury' || j.reviewStatus === 'verified')
          );

          return (
            <article
              key={stage.id}
              className="relative bg-white border border-slate-200 p-6 lg:p-8"
            >
              {/* Timeline Node Marker */}
              <div
                aria-hidden="true"
                className="absolute -left-[37px] md:-left-[53px] top-6 w-7 h-7 bg-[#0F172A] text-white text-xs font-mono-num font-bold flex items-center justify-center"
              >
                0{stage.stageNumber}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="font-mono-num font-semibold text-[#1E3A8A]">
                      GIAI ĐOẠN 0{stage.stageNumber}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-num">{stage.period}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {getStatusLabel(stage.status)}
                    </span>
                  </div>

                  <h2 className="text-xl font-semibold text-slate-900">
                    {stage.title}
                  </h2>

                  <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                    {stage.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => onSelectStageJournals(stage.stageNumber)}
                    className="px-3.5 py-2 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Xem {stageJournals.length} nhật ký ({stageJournals.map((j) => j.code).join(', ')})
                  </button>

                  {canEditStages && !isEditing && (
                    <button
                      onClick={() => startEditing(stage)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors whitespace-nowrap"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Cấu hình hoạt động
                    </button>
                  )}
                </div>
              </div>

              {/* View or Edit Sub-activities */}
              {!isEditing ? (
                <div className="mt-5">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Danh mục hoạt động thành phần ({stage.activities.length})
                  </h3>
                  <ol className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stage.activities.map((activity, idx) => (
                      <li
                        key={idx}
                        className="p-3.5 bg-[#FAF9F6] border border-slate-200 text-xs text-slate-800 flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className="font-mono-num font-semibold text-[#1E3A8A] shrink-0">
                          {stage.stageNumber}.{idx + 1}
                        </span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <div className="mt-5 bg-[#FAF9F6] border border-slate-300 p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-900">
                      Chỉnh sửa & sắp xếp hoạt động — {draftStage.title}
                    </h3>
                    {activeRole === 'teacher_thuy_mai' && (
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`stage-status-${stage.id}`}
                          className="text-xs font-medium text-slate-700"
                        >
                          Trạng thái xác minh:
                        </label>
                        <select
                          id={`stage-status-${stage.id}`}
                          value={draftStage.status}
                          onChange={(e) =>
                            setDraftStage({
                              ...draftStage,
                              status: e.target.value as StageStatus,
                            })
                          }
                          className="text-xs border border-slate-300 bg-white px-2.5 py-1.5"
                        >
                          <option value="in_progress">Đang thực hiện</option>
                          <option value="completed">Đã hoàn thành thực tế</option>
                          <option value="verified">Đã được GVHD xác nhận</option>
                        </select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {draftStage.activities.map((act, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-white border border-slate-200 p-2"
                      >
                        <span className="font-mono-num text-xs font-semibold text-slate-500 px-2">
                          {stage.stageNumber}.{idx + 1}
                        </span>
                        <input
                          type="text"
                          aria-label={`Hoạt động ${stage.stageNumber}.${idx + 1}`}
                          value={act}
                          onChange={(e) => {
                            const next = [...draftStage.activities];
                            next[idx] = e.target.value;
                            setDraftStage({ ...draftStage, activities: next });
                          }}
                          className="flex-1 text-xs text-slate-900 px-2 py-1 border border-transparent focus:border-slate-300 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleMoveActivity(idx, -1)}
                          disabled={idx === 0}
                          aria-label={`Chuyển hoạt động ${idx + 1} lên`}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveActivity(idx, 1)}
                          disabled={idx === draftStage.activities.length - 1}
                          aria-label={`Chuyển hoạt động ${idx + 1} xuống`}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveActivity(idx)}
                          aria-label={`Xóa hoạt động ${idx + 1}`}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      aria-label="Tên hoạt động nhỏ mới"
                      placeholder="Nhập tên hoạt động nhỏ cần bổ sung..."
                      value={newActivityText}
                      onChange={(e) => setNewActivityText(e.target.value)}
                      className="flex-1 text-xs bg-white border border-slate-300 px-3 py-2"
                    />
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 whitespace-nowrap"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm hoạt động
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveStage}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-slate-800"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Lưu vào Firestore
                    </button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};
