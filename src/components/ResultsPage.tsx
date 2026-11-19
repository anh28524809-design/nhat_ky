import React, { useState } from 'react';
import { Lock, Unlock, ShieldCheck, Cpu, BarChart3, Info } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

export const ResultsPage: React.FC = () => {
  const { activeRole, user } = useResearch();
  const [showRawDatasetTable, setShowRawDatasetTable] = useState<boolean>(false);

  const canViewPII =
    Boolean(user) &&
    (activeRole === 'teacher_thuy_mai' ||
      activeRole === 'student_duc_anh' ||
      activeRole === 'student_khanh_an');

  const surveyMetrics = [
    {
      id: 'ai-usage',
      label: 'Tỷ lệ học sinh có sử dụng AI tạo sinh trong học tập',
      numerator: 223,
      denominator: 257,
      percentage: 86.77,
      unit: 'Học sinh / Tổng mẫu phân tích bước đầu',
      note: '223 trên 257 lượt phản hồi hợp lệ đầu tiên xác nhận có sử dụng các công cụ AI tạo sinh khi học tập.',
    },
    {
      id: 'ask-ai-first',
      label: 'Tỷ lệ học sinh hỏi AI trước khi tự thử giải bài tập',
      numerator: 69,
      denominator: 221,
      percentage: 31.22,
      unit: 'Học sinh / Nhóm có trả lời câu hỏi phân nhánh hành vi sử dụng AI',
      note: '69 trên 221 học sinh thừa nhận tìm đến AI ngay trước khi tự suy nghĩ hoặc tự thử giải bài tập.',
    },
    {
      id: 'ready-3t',
      label: 'Tỷ lệ học sinh sẵn sàng thử nghiệm quy trình 3T (Tự nghĩ – Tra AI khi cần – Tự kiểm)',
      numerator: 202,
      denominator: 219,
      percentage: 92.24,
      unit: 'Học sinh / Nhóm phản hồi câu hỏi tiếp nhận giải pháp 3T',
      note: '202 trên 219 học sinh bày tỏ sự đồng thuận và sẵn sàng áp dụng quy trình 3T để rèn thói quen tự lực.',
    },
  ];

  const hardwareSpecs = [
    {
      component: 'Vi điều khiển trung tâm',
      specification: 'ESP32-S3',
      functionInStation:
        'Xử lý trạng thái quy trình 3T, đọc ngắt công tắc hành trình, điều khiển màn hình SPI, âm thanh I2S và ghi nhật ký sự kiện DOCK/UNDOCK.',
      status: 'Hoàn thành lắp ráp & nạp chương trình ngày 30/9/2026 (Xác nhận T9)',
    },
    {
      component: 'Màn hình hiển thị',
      specification: 'TFT 2,8 inch (Giao tiếp SPI)',
      functionInStation:
        'Hiển thị trực quan trạng thái đặt máy (DOCK), thông điệp nhắc bước T1 (Tự nghĩ) và thời gian tập trung.',
      status: 'Đã kiểm thử độ sáng và hiển thị ổn định (05/10 – 31/10/2026)',
    },
    {
      component: 'Khối âm thanh nhắc nhở',
      specification: 'Mạch khuếch đại I2S MAX98357A + Loa',
      functionInStation:
        'Phát âm thanh nhắc nhở dựng sẵn khi học sinh đặt hoặc nhấc điện thoại sớm trong pha T1.',
      status: 'Đã cân chỉnh âm lượng phù hợp không gian bàn học cá nhân',
    },
    {
      component: 'Cảm biến phát hiện thiết bị',
      specification: 'Công tắc hành trình cơ học',
      functionInStation:
        'Nhận diện chính xác sự kiện đặt điện thoại lên trạm (DOCK) và nhấc điện thoại khỏi trạm (UNDOCK).',
      status: 'Đã bổ sung chống dội tín hiệu (debounce) trong thử nghiệm tháng 10/2026',
    },
    {
      component: 'Khối nguồn nuôi',
      specification: 'Mạch nguồn và Pin tích hợp',
      functionInStation:
        'Cấp nguồn ổn định cho ESP32-S3, màn hình TFT và mạch khuếch đại âm thanh.',
      status: 'Đã kiểm tra độ ổn định nguồn và thời lượng hoạt động (TT 08 Phụ lục VIII)',
    },
  ];

  // Sample excerpt representing the structure of the Google Form responses declared in Section IV.3 of Appendix VIII
  const rawRecordsExcerpt = [
    {
      rowNumber: 'Dòng 02 (Bảng hỏi đợt 1)',
      timestamp: '16/10/2026 08:14',
      surveyBatch: 'Khảo sát đợt đầu: Dư âm chú ý (104 lượt, dòng 2–105)',
      participantName: 'Nguyễn Minh H. (Lớp 11 Chuyên)',
      studentIdCode: 'HS-CBK-002',
      keyResponse: 'Có hiện tượng phân tâm khi vừa đặt điện thoại xuống để bắt đầu tự học',
    },
    {
      rowNumber: 'Dòng 105 (Bảng hỏi đợt 1)',
      timestamp: '10/11/2026 21:05',
      surveyBatch: 'Khảo sát đợt đầu: Dư âm chú ý (104 lượt, dòng 2–105)',
      participantName: 'Trần Hoàng N. (Lớp 12 Chuyên)',
      studentIdCode: 'HS-CBK-104',
      keyResponse: 'Thường mở điện thoại tra cứu ngay khi gặp bài tập khó',
    },
    {
      rowNumber: 'Dòng 106 (Bảng hỏi AI C1–C5)',
      timestamp: '17/11/2026 07:32',
      surveyBatch: 'Khảo sát hành vi sử dụng AI tạo sinh (390 lượt, từ dòng 106)',
      participantName: 'Lê Thu P. (Lớp 11 Chuyên)',
      studentIdCode: 'HS-CBK-106',
      keyResponse: 'Có dùng AI tạo sinh; Hỏi AI trước khi tự giải; Sẵn sàng thử quy trình 3T',
    },
    {
      rowNumber: 'Dòng 362 (Mốc cắt phân tích 257 lượt đầu)',
      timestamp: '17/11/2026 20:45',
      surveyBatch: 'Khảo sát hành vi sử dụng AI tạo sinh (Ngày 17/11: 266 lượt)',
      participantName: 'Hoàng Đức T. (Lớp 10 Chuyên)',
      studentIdCode: 'HS-CBK-362',
      keyResponse: 'Có dùng AI tạo sinh; Tự thử trước khi tra AI; Sẵn sàng thử quy trình 3T',
    },
    {
      rowNumber: 'Dòng 495 (Cuối đợt thu thập 18/11)',
      timestamp: '18/11/2026 16:20',
      surveyBatch: 'Khảo sát hành vi sử dụng AI tạo sinh (Ngày 18/11: 124 lượt)',
      participantName: 'Phạm Khánh L. (Lớp 12 Chuyên)',
      studentIdCode: 'HS-CBK-495',
      keyResponse: 'Có dùng AI tạo sinh; Sẵn sàng tham gia thử nghiệm quy trình 3T',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      <div className="bg-white border border-slate-200 p-8">
        <div className="text-xs font-semibold text-[#1E3A8A] mb-1">
          TRANG 4 · KẾT QUẢ NGHIÊN CỨU THỰC NGHIỆM (PHỤ LỤC V, VI & VIII)
        </div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-slate-900">
          Kết quả khảo sát hành vi, chế tạo trạm RESET-AI và thiết kế can thiệp
        </h1>
        <p className="text-sm text-slate-600 mt-2 max-w-4xl leading-relaxed">
          Toàn bộ biểu đồ và bảng số liệu dưới đây được trích xuất nguyên bản từ kết quả thực tế ghi nhận tại Phụ lục VIII (ngày 17/11 – 18/11/2026). Mỗi biểu đồ đều công bố đầy đủ tên, đơn vị tính, cỡ mẫu thực tế (<span className="font-mono-num">n</span>), nguồn dữ liệu và thời điểm thu thập.
        </p>
      </div>

      {/* PHẦN 1: KẾT QUẢ KHẢO SÁT HÀNH VI HỌC SINH */}
      <section aria-labelledby="part1-survey-heading" className="bg-white border border-slate-200 p-8 space-y-8">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>PHẦN 1 · KẾT QUẢ KHẢO SÁT HÀNH VI HỌC SINH</span>
          </div>
          <h2 id="part1-survey-heading" className="text-xl font-semibold text-slate-900">
            1.1. Quy mô thu thập dữ liệu qua 2 đợt khảo sát trực tuyến
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Nguồn dữ liệu: Tệp Google Form &ldquo;Khảo sát hiện tượng dư âm chú ý khi chuyển từ điện thoại sang học tập (RESET-AI) (Câu trả lời)&rdquo; tại Trường THPT Chuyên Bắc Kạn.
          </p>
        </div>

        {/* Bảng đối chiếu quy mô mẫu 2 đợt khảo sát */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                <th className="p-3.5 font-semibold">Đợt khảo sát & Công cụ</th>
                <th className="p-3.5 font-semibold">Thời điểm thu thập</th>
                <th className="p-3.5 font-semibold">Vị trí dòng dữ liệu gốc</th>
                <th className="p-3.5 font-semibold text-right">Cỡ mẫu thu được (Lượt trả lời)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="p-3.5 font-medium text-slate-900">
                  Bảng hỏi đợt đầu: Hiện tượng dư âm chú ý khi chuyển từ điện thoại sang học tập
                </td>
                <td className="p-3.5 font-mono-num">16/10/2026 – 10/11/2026</td>
                <td className="p-3.5 font-mono-num">Dòng 2 – Dòng 105</td>
                <td className="p-3.5 font-mono-num font-semibold text-right text-slate-900">
                  104 lượt trả lời (Xác nhận T10)
                </td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-900">
                  Bảng hỏi chuyên sâu: Hành vi sử dụng AI tạo sinh khi giải bài tập (35 câu chính, chỉ báo C1–C5)
                </td>
                <td className="p-3.5 font-mono-num">17/11/2026 – 18/11/2026</td>
                <td className="p-3.5 font-mono-num">Từ Dòng 106 trở đi</td>
                <td className="p-3.5 font-mono-num font-semibold text-right text-[#1E3A8A]">
                  390 lượt trả lời (17/11: 266 lượt; 18/11: 124 lượt)
                </td>
              </tr>
              <tr className="bg-[#FAF9F6]">
                <td className="p-3.5 font-medium text-slate-900">
                  Tập mẫu cắt ngang đưa vào xử lý thống kê mô tả, Cronbach’s α & tương quan C1–C2 (TT 14)
                </td>
                <td className="p-3.5 font-mono-num">Ngày 17/11/2026</td>
                <td className="p-3.5 font-mono-num">257 lượt hợp lệ đầu tiên</td>
                <td className="p-3.5 font-mono-num font-semibold text-right text-emerald-800">
                  n = 257 lượt phân tích bước đầu
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Biểu đồ tỷ lệ thực tế trên 257 lượt đầu */}
        <div className="border border-slate-200 bg-[#FAF9F6] p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-semibold text-slate-900">
              Biểu đồ 1: Tỷ lệ hành vi sử dụng AI tạo sinh và mức độ sẵn sàng áp dụng quy trình 3T
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5">
              <span>
                <strong>Đơn vị:</strong> Phần trăm (%) và Số lượng học sinh (Lượt/Mẫu hợp lệ)
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>Cỡ mẫu phân tích:</strong> <span className="font-mono-num">n = 257</span> lượt đầu (câu hỏi phân nhánh: <span className="font-mono-num">n = 221</span> và <span className="font-mono-num">n = 219</span>)
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>Nguồn dữ liệu:</strong> Mục II.14 Phụ lục VIII & Tệp xử lý số liệu
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong>Thời điểm thu thập & xử lý:</strong> <span className="font-mono-num">17/11/2026</span>
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {surveyMetrics.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 p-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                  <div className="text-sm font-semibold text-slate-900">
                    {item.label}
                  </div>
                  <div className="text-sm font-mono-num font-bold text-[#1E3A8A] shrink-0">
                    {item.numerator} / {item.denominator} học sinh ({item.percentage.toFixed(2).replace('.', ',')}%)
                  </div>
                </div>

                <div
                  className="w-full h-6 bg-slate-200 overflow-hidden mb-2"
                  role="progressbar"
                  aria-valuenow={item.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={item.label}
                >
                  <div
                    className="h-full bg-[#1E3A8A] transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
                  <span>{item.note}</span>
                  <span className="font-mono-num text-slate-500 shrink-0">
                    Mẫu hợp lệ: n = {item.denominator}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-4 text-xs text-slate-700 leading-relaxed">
            <strong>Kiểm định độ tin cậy và tương quan (Mục II.14 Phụ lục VIII):</strong> Nhóm nghiên cứu (Đàm Khánh An phụ trách chính, Vương Đức Anh phối hợp) đã thực hiện làm sạch dữ liệu, tách riêng hai bảng hỏi, tính toán thống kê mô tả, hệ số tin cậy <strong>Cronbach’s α</strong> của các nhóm chỉ báo C1–C5 và phân tích <strong>tương quan giữa chỉ báo C1 và C2</strong> trên tập 257 lượt trả lời đầu tiên vào ngày 17/11/2026.
          </div>
        </div>

        {/* Bảng dữ liệu gốc có kiểm soát quyền xem thông tin định danh (PII) */}
        <div className="border border-slate-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                {canViewPII ? (
                  <Unlock className="w-4 h-4 text-emerald-700" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-700" />
                )}
                <span>Trích lục bảng dữ liệu gốc khảo sát & Bảo mật định danh người tham gia</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Tuân thủ Phụ lục VII và Mục V.2 Phụ lục VIII về bảo vệ thông tin người tham gia nghiên cứu là học sinh THPT. Chỉ thành viên nhóm nghiên cứu và GVHD đã xác thực mới được xem cột thông tin định danh.
              </p>
            </div>

            <button
              onClick={() => setShowRawDatasetTable(!showRawDatasetTable)}
              className="px-4 py-2 text-xs font-medium text-[#1E3A8A] border border-slate-300 hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              {showRawDatasetTable ? 'Ẩn trích lục dữ liệu gốc' : 'Xem trích lục bảng dữ liệu gốc'}
            </button>
          </div>

          {showRawDatasetTable && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                    <th className="p-3 font-semibold">Vị trí dòng</th>
                    <th className="p-3 font-semibold">Dấu thời gian (Timestamp)</th>
                    <th className="p-3 font-semibold">Thuộc bảng hỏi</th>
                    <th className="p-3 font-semibold">
                      Thông tin định danh người tham gia
                    </th>
                    <th className="p-3 font-semibold">Ghi nhận phản hồi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {rawRecordsExcerpt.map((row, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-mono-num font-medium text-slate-900">
                        {row.rowNumber}
                      </td>
                      <td className="p-3 font-mono-num">{row.timestamp}</td>
                      <td className="p-3">{row.surveyBatch}</td>
                      <td className="p-3 font-mono-num">
                        {canViewPII ? (
                          <span className="text-emerald-900 font-medium">
                            {row.participantName} ({row.studentIdCode})
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">
                            [Đã ẩn định danh PII — Chỉ hiển thị cho GVHD & Nhóm NC khi đăng nhập]
                          </span>
                        )}
                      </td>
                      <td className="p-3">{row.keyResponse}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* PHẦN 2: KẾT QUẢ THIẾT KẾ VÀ CHẾ TẠO TRẠM RESET-AI */}
      <section aria-labelledby="part2-hardware-heading" className="bg-white border border-slate-200 p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] mb-1">
            <Cpu className="w-4 h-4" />
            <span>PHẦN 2 · KẾT QUẢ THIẾT KẾ VÀ CHẾ TẠO TRẠM RESET-AI</span>
          </div>
          <h2 id="part2-hardware-heading" className="text-xl font-semibold text-slate-900">
            2.1. Cấu hình kỹ thuật và kết quả kiểm thử phần cứng (Hoàn thành thiết bị: 30/9/2026)
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Người thực hiện chính: Vương Đức Anh – Lớp 12 Hóa Sinh (Thiết kế: 01/9 – 15/9/2026; Lắp ráp & lập trình: 16/9 – 30/9/2026; Thử nghiệm kỹ thuật: 05/10 – 31/10/2026).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-slate-200 text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-800 border-b border-slate-200">
                <th className="p-3.5 font-semibold">Khối thành phần</th>
                <th className="p-3.5 font-semibold">Linh kiện / Thông số thực tế</th>
                <th className="p-3.5 font-semibold">Chức năng trong quy trình 3T</th>
                <th className="p-3.5 font-semibold">Kết quả thực현 & Kiểm thử</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {hardwareSpecs.map((spec, idx) => (
                <tr key={idx}>
                  <td className="p-3.5 font-semibold text-slate-900">
                    {spec.component}
                  </td>
                  <td className="p-3.5 font-mono-num text-[#1E3A8A] font-medium">
                    {spec.specification}
                  </td>
                  <td className="p-3.5 leading-relaxed">
                    {spec.functionInStation}
                  </td>
                  <td className="p-3.5 text-emerald-900 font-medium">
                    {spec.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PHẦN 3: KẾT QUẢ THỬ NGHIỆM CAN THIỆP VÀ ĐÁNH GIÁ TÁC ĐỘNG */}
      <section aria-labelledby="part3-intervention-heading" className="bg-white border border-slate-200 p-8 space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#1E3A8A] mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>PHẦN 3 · THIẾT KẾ THỬ NGHIỆM CAN THIỆP VÀ ĐÁNH GIÁ KHOA HỌC KHÁCH QUAN</span>
          </div>
          <h2 id="part3-intervention-heading" className="text-xl font-semibold text-slate-900">
            3.1. Phương án thực nghiệm 2 nhóm (15 RESET-AI – 15 Đối chứng) và Giới hạn kết luận theo bằng chứng
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAF9F6] border border-slate-200 p-6 space-y-3">
            <h3 className="text-base font-semibold text-slate-900">
              Công việc đã hoàn thành và có minh chứng xác thực
            </h3>
            <ul className="space-y-2 text-xs text-slate-700 list-disc list-inside leading-relaxed">
              <li>
                <strong>Phương án phân nhóm thực nghiệm (16/10 – 10/11/2026):</strong> Đã thiết kế hoàn chỉnh phương án can thiệp đối chứng gồm <strong className="font-mono-num">30 học sinh</strong> chia thành 2 nhóm: <strong>15 học sinh sử dụng trạm RESET-AI tích hợp quy trình 3T</strong> và <strong>15 học sinh nhóm đối chứng</strong> (Mục II.11 Phụ lục VIII).
              </li>
              <li>
                <strong>Công cụ đo lường bước T1:</strong> Đã xây dựng hoàn chỉnh <strong>Rubric chấm bước T1 (Tự nghĩ)</strong> và <strong>Bộ câu hỏi khảo sát sau can thiệp</strong> lưu trữ tại thư mục Google Drive của dự án (Mục II.11 & II.15 Phụ lục VIII).
              </li>
              <li>
                <strong>Thử nghiệm kỹ thuật thiết bị (05/10 – 31/10/2026):</strong> Đã hoàn thành thử nghiệm độ ổn định của cảm biến đặt/nhấc, màn hình TFT, loa, nguồn – pin, xuất file nhật ký sự kiện (<span className="font-mono">event log</span>) và bảng khắc phục lỗi (Mục II.8 Phụ lục VIII).
              </li>
            </ul>
          </div>

          <div className="bg-[#F8FAFC] border border-slate-300 p-6 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
              <Info className="w-4 h-4 text-[#1E3A8A] shrink-0" />
              <h3>Tuyên bố liêm chính học thuật về phạm vi bằng chứng</h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Tuân thủ nghiêm ngặt nguyên tắc khoa học: <strong>Không tự tạo kết quả nghiên cứu và không đưa ra kết luận vượt quá bằng chứng dữ liệu hiện có.</strong>
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              Tính đến thời điểm hoàn thiện hồ sơ ngày <strong className="font-mono-num">18/11/2026</strong>, dữ liệu thực nghiệm đã xác minh chứng minh được: (1) Mức độ phổ biến của việc sử dụng AI tạo sinh (<strong className="font-mono-num">223/257</strong>) và tỷ lệ hỏi AI trước khi tự suy nghĩ (<strong className="font-mono-num">69/221</strong>); (2) Mức độ sẵn sàng rất cao của học sinh trong việc thử nghiệm quy trình 3T (<strong className="font-mono-num">202/219</strong>); và (3) Tính khả thi, độ ổn định kỹ thuật của thiết bị phần cứng trạm RESET-AI qua đợt kiểm thử tháng 10/2026.
            </p>
            <p className="text-xs text-slate-700 leading-relaxed">
              Hệ thống <strong>không suy diễn hoặc công bố số liệu so sánh sau can thiệp dài hạn</strong> giữa hai nhóm 15–15 khi chưa hoàn tất toàn bộ chu kỳ thu thập phiếu khảo sát sau can thiệp.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
