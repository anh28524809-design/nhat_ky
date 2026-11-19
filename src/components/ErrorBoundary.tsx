import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Đã xảy ra lỗi không xác định.',
    };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-white border border-slate-200 p-8">
            <div className="flex items-center gap-3 text-red-700 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h1 className="text-xl font-semibold">
                Cảnh báo quyền truy cập hoặc kết nối cơ sở dữ liệu
              </h1>
            </div>
            <p className="text-sm text-slate-600 mb-4 leading-relaxed">
              Hệ thống phát hiện lỗi khi truy xuất hoặc ghi dữ liệu Firestore. Chi tiết kỹ thuật:
            </p>
            <pre className="bg-slate-50 border border-slate-200 p-4 text-xs font-mono text-slate-800 overflow-x-auto mb-6">
              {this.state.errorMessage}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tải lại ứng dụng
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
