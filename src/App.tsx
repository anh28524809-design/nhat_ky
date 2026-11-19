/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Maximize2,
  Minimize2,
  LogIn,
  LogOut,
  X,
  Shield,
  Menu,
} from 'lucide-react';
import { ResearchProvider, useResearch } from './context/ResearchContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { OverviewPage } from './components/OverviewPage';
import { TimelinePage } from './components/TimelinePage';
import { JournalEvidencePage } from './components/JournalEvidencePage';
import { ResultsPage } from './components/ResultsPage';
import { DossierPage } from './components/DossierPage';
import { UserRole } from './types/research';

type MainTab = 'overview' | 'timeline' | 'journal' | 'results' | 'dossier';

const MainShell: React.FC = () => {
  const {
    user,
    activeRole,
    setActiveRole,
    isConnectedToFirestore,
    signInWithGoogle,
    signOut,
  } = useResearch();

  const [activeTab, setActiveTab] = useState<MainTab>('overview');
  const [selectedStageForJournal, setSelectedStageForJournal] = useState<
    number | 'all'
  >('all');
  const [isPresentationMode, setIsPresentationMode] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const navItems: { id: MainTab; label: string }[] = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'timeline', label: 'Tiến trình nghiên cứu' },
    { id: 'journal', label: 'Nhật ký và minh chứng' },
    { id: 'results', label: 'Kết quả nghiên cứu' },
    { id: 'dossier', label: 'Hồ sơ khoa học' },
  ];

  const handleNavigateTab = (tab: MainTab, stageNumber?: number) => {
    if (stageNumber !== undefined) {
      setSelectedStageForJournal(stageNumber);
    } else if (tab === 'journal') {
      setSelectedStageForJournal('all');
    }
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFullscreenPresentation = () => {
    const nextState = !isPresentationMode;
    setIsPresentationMode(nextState);
    if (nextState && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        // Ignore iframe fullscreen restriction if blocked by sandbox
      });
    } else if (!nextState && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'teacher_thuy_mai') return 'GVHD: Vũ Thúy Mai';
    if (role === 'student_duc_anh') return 'HS: Vương Đức Anh';
    if (role === 'student_khanh_an') return 'HS: Đàm Khánh An';
    return 'Chế độ: Giám khảo';
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(
        `Thông báo đăng nhập: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#FAF9F6] text-slate-900 ${
        isPresentationMode ? 'text-base lg:text-lg' : ''
      }`}
    >
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 lg:px-8 py-3.5 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#overview"
            onClick={(e) => {
              e.preventDefault();
              handleNavigateTab('overview');
            }}
            className="text-base lg:text-lg font-bold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
          >
            RESET-AI Research Journal
          </a>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-[#0F172A] font-semibold border-[#1E3A8A]'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action (plus mobile menu hamburger on small screens) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowRoleModal(true)}
              className="px-3.5 py-2 text-xs font-medium text-white bg-[#0F172A] hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              {getRoleLabel(activeRole)}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu điều hướng trên điện thoại"
              className="md:hidden p-2 text-slate-700 border border-slate-200"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Menu di động"
            className="md:hidden mt-3 pt-3 border-t border-slate-200 flex flex-col gap-1"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigateTab(item.id)}
                className={`text-left px-3 py-2 text-xs font-medium ${
                  activeTab === item.id
                    ? 'bg-slate-100 text-[#0F172A] font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}
      </header>

      {/* Secondary Academic Utility Strip (Below Header) */}
      <div className="bg-[#F1F5F9] border-b border-slate-200 px-4 lg:px-8 py-2 text-xs text-slate-600 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-slate-800">
              Trường THPT Chuyên Bắc Kạn
            </span>
            <span aria-hidden="true">·</span>
            <span>Nhóm NC: Vương Đức Anh, Đàm Khánh An</span>
            <span aria-hidden="true">·</span>
            <span>GVHD: Vũ Thúy Mai</span>
            <span aria-hidden="true">·</span>
            <span>
              Cơ sở dữ liệu:{' '}
              {isConnectedToFirestore
                ? 'Cloud Firestore đã kết nối'
                : 'Đang kiểm tra kết nối Firestore'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleFullscreenPresentation}
              className="inline-flex items-center gap-1.5 font-medium text-[#1E3A8A] hover:underline whitespace-nowrap"
            >
              {isPresentationMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Thoát chế độ trình chiếu</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Chế độ trình chiếu Hội đồng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <main
        className={`flex-1 w-full mx-auto px-4 lg:px-8 pt-8 ${
          isPresentationMode ? 'max-w-[1400px]' : 'max-w-7xl'
        }`}
      >
        {activeTab === 'overview' && (
          <OverviewPage onNavigateTab={handleNavigateTab} />
        )}
        {activeTab === 'timeline' && (
          <TimelinePage
            onSelectStageJournals={(stageNum) =>
              handleNavigateTab('journal', stageNum)
            }
          />
        )}
        {activeTab === 'journal' && (
          <JournalEvidencePage initialStageFilter={selectedStageForJournal} />
        )}
        {activeTab === 'results' && <ResultsPage />}
        {activeTab === 'dossier' && <DossierPage />}
      </main>

      {/* Academic Footer */}
      <footer className="bg-white border-t border-slate-200 px-4 lg:px-8 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <strong>RESET-AI | Hồ sơ và Nhật ký Nghiên cứu Khoa học</strong> · Trường THPT Chuyên Bắc Kạn · Kế hoạch 5999/KH-SGDĐT ngày 16/10/2026
          </div>
          <div className="font-mono-num">
            Thời gian thực hiện dự án: 01/8/2026 – 18/11/2026
          </div>
        </div>
      </footer>

      {/* MODAL PHÂN QUYỀN & ĐĂNG NHẬP FIREBASE AUTHENTICATION (MỤC VIII) */}
      {showRoleModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Phân quyền và Đăng nhập hệ thống"
          className="fixed inset-0 z-50 bg-slate-900/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 max-w-xl w-full p-6 lg:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#1E3A8A]" />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Xác thực tài khoản & Kiểm tra quyền truy cập
                  </h2>
                  <p className="text-xs text-slate-600">
                    Thực thi phân quyền bằng Firebase Authentication & Firestore Security Rules
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                aria-label="Đóng bảng phân quyền"
                className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Firebase Authentication Status */}
            <div className="bg-[#FAF9F6] border border-slate-200 p-4 space-y-3">
              <div className="text-xs font-semibold text-slate-800">
                1. Xác thực Google (Firebase Authentication) để ghi dữ liệu thật vào Firestore
              </div>
              {user ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs text-slate-700">
                    Đã đăng nhập: <strong>{user.displayName || user.email}</strong> ({user.email})
                  </div>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 border border-red-300 bg-white hover:bg-red-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Hiện đang ở phiên truy cập công khai (Chế độ Giám khảo chỉ đọc). Để lưu nhật ký mới, tải tệp lên Cloud Storage hoặc ký xác nhận vào Firestore, vui lòng đăng nhập bằng Google.
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white text-xs font-medium hover:bg-slate-800"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Đăng nhập bằng tài khoản Google
                  </button>
                </div>
              )}
              {authError && (
                <p className="text-xs text-red-700 mt-2">{authError}</p>
              )}
            </div>

            {/* Role Selection / Preview Before Public Publishing (Mục VIII & IX) */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-800">
                2. Chuyển chế độ giao diện & Kiểm tra quyền xem trước khi báo cáo công khai
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  {
                    role: 'jury' as UserRole,
                    title: 'Hội đồng Giám khảo (Mặc định khi trình chiếu)',
                    desc: 'Xem tổng quan, timeline, kết quả, nhật ký và minh chứng đã duyệt. Không hiển thị dữ liệu nháp hoặc thông tin định danh cá nhân (PII).',
                  },
                  {
                    role: 'student_duc_anh' as UserRole,
                    title: 'Học sinh nghiên cứu: Vương Đức Anh (Lớp 12 Hóa Sinh – Trưởng nhóm)',
                    desc: 'Tạo nhật ký, chỉnh sửa bản nháp, tải tệp sơ đồ/mã nguồn ESP32-S3, gửi GVHD xác nhận.',
                  },
                  {
                    role: 'student_khanh_an' as UserRole,
                    title: 'Học sinh nghiên cứu: Đàm Khánh An (Lớp 11 Hóa – Thành viên)',
                    desc: 'Tạo nhật ký, cập nhật dữ liệu khảo sát C1–C5, tải tệp thống kê và báo cáo Phụ lục V, VI.',
                  },
                  {
                    role: 'teacher_thuy_mai' as UserRole,
                    title: 'Giáo viên hướng dẫn: Vũ Thúy Mai (Quản trị & Kiểm duyệt)',
                    desc: 'Quản trị cấu trúc giai đoạn, kiểm tra, nhận xét, ký xác nhận nhật ký (T8–T11) và duyệt minh chứng hiển thị cho giám khảo.',
                  },
                ].map((opt) => (
                  <button
                    key={opt.role}
                    onClick={() => {
                      setActiveRole(opt.role);
                      setShowRoleModal(false);
                    }}
                    className={`text-left p-3.5 border transition-colors ${
                      activeRole === opt.role
                        ? 'border-[#1E3A8A] bg-slate-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-900">
                        {opt.title}
                      </span>
                      {activeRole === opt.role && (
                        <span className="text-xs font-semibold text-[#1E3A8A]">
                          Đang chọn
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ResearchProvider>
        <MainShell />
      </ResearchProvider>
    </ErrorBoundary>
  );
}
