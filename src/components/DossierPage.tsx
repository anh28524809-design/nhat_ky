import React, { useEffect, useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Printer,
  Database,
  X,
  Edit3,
  Save,
} from 'lucide-react';
import { useResearch } from '../context/ResearchContext';
import { AppendixDocument, StageStatus } from '../types/research';
import { generateAppendixVIIIExportMarkdown } from '../utils/researchLogic';

export const DossierPage: React.FC = () => {
  const {
    appendices,
    journals,
    stages,
    evidences,
    activeRole,
    user,
    isSyncingSeed,
    syncInitialDossierToFirestore,
    updateAppendixDocument,
  } = useResearch();

  const [selectedAppendix, setSelectedAppendix] =
    useState<AppendixDocument | null>(null);
  const [rawAppendixVIIIText, setRawAppendixVIIIText] = useState<string>('');
  const [editingAppendix, setEditingAppendix] =
    useState<AppendixDocument | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const canManage =
    activeRole === 'teacher_thuy_mai' ||
    activeRole === 'student_duc_anh' ||
    activeRole === 'student_khanh_an';

  useEffect(() => {
    fetch('/assets/aistudio/Phu_luc_VIII_RESET_AI_98e95f5d.md')
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => setRawAppendixVIIIText(text))
      .catch(() => setRawAppendixVIIIText(''));
  }, []);

  const handleDownloadAppendixVIIIMarkdown = () => {
    const md = generateAppendixVIIIExportMarkdown(journals, appendices);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Phu_luc_VIII_Nhat_ky_va_Minh_chung_RESET_AI.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadBackupJSON = () => {
    const backupPayload = {
      exportedAt: new Date().toISOString(),
      project:
        'RESET-AI | Trường THPT Chuyên Bắc Kạn (Kế hoạch 5999/KH-SGDĐT)',
      stages,
      journals,
      evidences,
      appendices,
    };
    const blob = new Blob([JSON.stringify(backupPayload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'RESET_AI_Full_Research_Dossier_Backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveAppendixEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppendix) return;
    if (!user) {
      setStatusMessage(
        'Vui lòng đăng nhập Firebase Authentication trước khi lưu cập nhật phụ lục hồ sơ vào Firestore.'
      );
      return;
    }
    try {
      await updateAppendixDocument(editingAppendix);
      setEditingAppendix(null);
      setStatusMessage('Đã lưu cập nhật danh mục phụ lục vào Firestore.');
    } catch (err) {
      setStatusMessage(
        `Lỗi cập nhật: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Header & Export Actions */}
      <section className="bg-white border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-xs font-semibold text-[#1E3A8A] mb-1">
              TRANG 5 · HỒ SƠ KHOA HỌC DỰ THI THEO KẾ HOẠCH 5999/KH-SGDĐT
            </div>
            <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
              Danh mục Phụ lục Hồ sơ Khoa học (Phụ lục II – Phụ lục IX)
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Quản lý tập trung toàn bộ phụ lục hồ sơ theo quy định tại Kế hoạch số 5999/KH-SGDĐT ngày 16/10/2026 của Sở GDĐT Bắc Kạn. Cho phép kết xuất trực tiếp Nhật ký nghiên cứu theo đúng các trường của Phụ lục VIII và sao lưu toàn bộ cơ sở dữ liệu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 no-print">
            <button
              onClick={handleDownloadAppendixVIIIMarkdown}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-white bg-[#0F172A] hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Xuất Phụ lục VIII (.md)
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-[#1E3A8A] border border-[#1E3A8A] bg-white hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              In hồ sơ / Xuất PDF
            </button>

            <button
              onClick={handleDownloadBackupJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <Database className="w-4 h-4" />
              Sao lưu dữ liệu (.json)
            </button>
          </div>
        </div>

        {canManage && (
          <div className="mt-5 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F6] border border-slate-200 p-4">
            <div className="text-xs text-slate-700">
              <strong>Đồng bộ hồ sơ gốc lên Cloud Firestore:</strong> Nếu cơ sở dữ liệu Firestore của dự án mới khởi tạo, nhấn nút bên phải để ghi toàn bộ 6 giai đoạn, 16 mục nhật ký Phụ lục VIII và các phụ lục vào Firestore thực tế.
            </div>
            <button
              onClick={async () => {
                try {
                  await syncInitialDossierToFirestore();
                  setStatusMessage(
                    'Đã đồng bộ toàn bộ hồ sơ gốc Phụ lục VIII lên Cloud Firestore thành công.'
                  );
                } catch (err) {
                  setStatusMessage(
                    err instanceof Error ? err.message : String(err)
                  );
                }
              }}
              disabled={isSyncingSeed}
              className="px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap shrink-0"
            >
              {isSyncingSeed
                ? 'Đang ghi vào Firestore...'
                : 'Đồng bộ dữ liệu gốc lên Firestore'}
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 p-3 bg-slate-100 border border-slate-300 text-xs text-slate-900">
            {statusMessage}
          </div>
        )}
      </section>

      {/* BẢNG DANH MỤC HỒ SƠ PHỤ LỤC II -> IX */}
      <section aria-labelledby="appendices-table-heading" className="bg-white border border-slate-200 p-8">
        <h2 id="appendices-table-heading" className="text-xl font-semibold text-slate-900 mb-6">
          Bảng kiểm tra trạng thái các Phụ lục dự thi
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                <th className="p-3.5 font-semibold">Mã Phụ lục</th>
                <th className="p-3.5 font-semibold">Tên hồ sơ theo Kế hoạch 5999</th>
                <th className="p-3.5 font-semibold">Tệp đính kèm</th>
                <th className="p-3.5 font-semibold">Người phụ trách</th>
                <th className="p-3.5 font-semibold">Trạng thái</th>
                <th className="p-3.5 font-semibold">Ngày cập nhật</th>
                <th className="p-3.5 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {appendices.map((ap) => (
                <tr key={ap.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 font-mono-num font-bold text-[#1E3A8A] whitespace-nowrap">
                    {ap.appendixCode}
                  </td>
                  <td className="p-3.5">
                    <div className="font-semibold text-slate-900 mb-0.5">
                      {ap.title}
                    </div>
                    <div className="text-slate-600 leading-relaxed">
                      {ap.description}
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">
                    <div className="inline-flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
                      <span className="break-all">{ap.fileName}</span>
                    </div>
                  </td>
                  <td className="p-3.5">{ap.responsiblePerson}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {ap.status === 'verified'
                        ? 'Đã xác nhận'
                        : ap.status === 'completed'
                        ? 'Đã hoàn thành'
                        : 'Đang rà soát'}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono-num whitespace-nowrap">
                    {ap.updatedLabel}
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setSelectedAppendix(ap)}
                        aria-label={`Xem nội dung ${ap.appendixCode}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#1E3A8A] border border-slate-300 bg-white hover:bg-slate-50"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Xem nội dung
                      </button>
                      {canManage && (
                        <button
                          onClick={() => setEditingAppendix({ ...ap })}
                          aria-label={`Cập nhật ${ap.appendixCode}`}
                          className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-200 bg-slate-50"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* BẢN XEM TRƯỚC TRỰC TIẾP BIỂU MẪU PHỤ LỤC VIII CHUẨN IN ẤN */}
      <section aria-labelledby="appendix-viii-preview-heading" className="bg-white border border-slate-200 p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 id="appendix-viii-preview-heading" className="text-xl font-semibold text-slate-900">
              Bảng trích xuất Phụ lục VIII (Chuẩn biểu mẫu Kế hoạch 5999/KH-SGDĐT)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Hiển thị trực tiếp từ 16 bản ghi nhật ký đã xác nhận để Hội đồng giám khảo đối chiếu từng cột: TT, Ngày, Nội dung, Địa điểm, Người thực hiện, Minh chứng, Kết quả và Xác nhận của GVHD.
            </p>
          </div>
          <button
            onClick={handleDownloadAppendixVIIIMarkdown}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0 no-print"
          >
            <Download className="w-3.5 h-3.5" />
            Tải tệp Phụ lục VIII
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-300 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-900 border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-300 font-semibold text-center">TT</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Ngày</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Nội dung</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Địa điểm thực hiện</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Người thực hiện</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Minh chứng</th>
                <th className="p-2.5 border-r border-slate-300 font-semibold">Kết quả</th>
                <th className="p-2.5 font-semibold">Xác nhận của GVHD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300 text-slate-800">
              {journals
                .filter((j) => activeRole !== 'jury' || j.reviewStatus === 'verified')
                .map((j) => (
                  <tr key={j.id}>
                    <td className="p-2.5 border-r border-slate-300 font-mono-num text-center font-semibold">
                      {j.orderIndex}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 font-mono-num whitespace-nowrap">
                      {j.actualDateOrRange}
                    </td>
                    <td className="p-2.5 border-r border-slate-300 leading-relaxed">
                      {j.workDone}
                    </td>
                    <td className="p-2.5 border-r border-slate-300">
                      {j.location}
                    </td>
                    <td className="p-2.5 border-r border-slate-300">
                      {j.performer}
                    </td>
                    <td className="p-2.5 border-r border-slate-300">
                      {j.evidenceSummary}
                    </td>
                    <td className="p-2.5 border-r border-slate-300">
                      {j.actualResult}
                    </td>
                    <td className="p-2.5 font-medium text-emerald-900">
                      {j.teacherConfirmationNote ||
                        (j.reviewStatus === 'verified' ? 'Đã xác nhận' : '')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL XEM NỘI DUNG PHỤ LỤC */}
      {selectedAppendix && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chi tiết ${selectedAppendix.appendixCode}`}
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 lg:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="text-xs font-mono-num font-semibold text-[#1E3A8A] mb-1">
                  {selectedAppendix.appendixCode} · Cập nhật: {selectedAppendix.updatedLabel}
                </div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {selectedAppendix.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedAppendix(null)}
                aria-label="Đóng"
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#FAF9F6] border border-slate-200 p-4 text-xs text-slate-700 space-y-1.5">
              <div>
                <strong>Tệp hồ sơ:</strong> {selectedAppendix.fileName}
              </div>
              <div>
                <strong>Người phụ trách:</strong> {selectedAppendix.responsiblePerson}
              </div>
              <div>
                <strong>Mô tả:</strong> {selectedAppendix.description}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Tóm tắt nội dung hồ sơ
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed p-4 bg-slate-50 border border-slate-200">
                {selectedAppendix.contentSummary}
              </p>
            </div>

            {selectedAppendix.appendixCode === 'Phụ lục VIII' &&
              rawAppendixVIIIText && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Toàn văn tệp Phụ lục VIII gốc đính kèm trong workspace
                  </h3>
                  <pre className="p-4 bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
                    {rawAppendixVIIIText}
                  </pre>
                </div>
              )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              {selectedAppendix.fileUrl && (
                <a
                  href={selectedAppendix.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-medium hover:bg-slate-800"
                >
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống tệp gốc
                </a>
              )}
              <button
                onClick={() => setSelectedAppendix(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA PHỤ LỤC (CHO GVHD / HỌC SINH) */}
      {editingAppendix && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Chỉnh sửa ${editingAppendix.appendixCode}`}
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveAppendixEdit}
            className="bg-white border border-slate-200 max-w-2xl w-full p-6 lg:p-8 space-y-4"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Cập nhật thông tin {editingAppendix.appendixCode} – {editingAppendix.title}
              </h2>
              <button
                type="button"
                onClick={() => setEditingAppendix(null)}
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên tệp đính kèm
                </label>
                <input
                  type="text"
                  required
                  value={editingAppendix.fileName}
                  onChange={(e) =>
                    setEditingAppendix({
                      ...editingAppendix,
                      fileName: e.target.value,
                    })
                  }
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Trạng thái hồ sơ
                </label>
                <select
                  value={editingAppendix.status}
                  onChange={(e) =>
                    setEditingAppendix({
                      ...editingAppendix,
                      status: e.target.value as StageStatus,
                    })
                  }
                  className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="in_progress">Đang rà soát</option>
                  <option value="completed">Đã hoàn thành</option>
                  <option value="verified">Đã xác nhận</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Người phụ trách
              </label>
              <input
                type="text"
                required
                value={editingAppendix.responsiblePerson}
                onChange={(e) =>
                  setEditingAppendix({
                    ...editingAppendix,
                    responsiblePerson: e.target.value,
                  })
                }
                className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Đường dẫn tệp đính kèm (URL Google Drive hoặc Cloud Storage)
              </label>
              <input
                type="text"
                value={editingAppendix.fileUrl}
                onChange={(e) =>
                  setEditingAppendix({
                    ...editingAppendix,
                    fileUrl: e.target.value,
                  })
                }
                className="w-full text-xs border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tóm tắt nội dung hồ sơ
              </label>
              <textarea
                rows={4}
                required
                value={editingAppendix.contentSummary}
                onChange={(e) =>
                  setEditingAppendix({
                    ...editingAppendix,
                    contentSummary: e.target.value,
                  })
                }
                className="w-full text-xs border border-slate-300 bg-white p-2.5"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingAppendix(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 bg-white hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-[#1E3A8A] hover:bg-slate-800"
              >
                <Save className="w-3.5 h-3.5" />
                Lưu vào Firestore
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
