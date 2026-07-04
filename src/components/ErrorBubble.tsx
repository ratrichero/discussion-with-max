import { AlertTriangle, RefreshCw, ArrowRightLeft, ExternalLink } from 'lucide-react';

interface ErrorBubbleProps {
  error: string;
  errorCode?: string;
  onRetry: () => void;
  onSwitchModel?: () => void;
  providerName?: string;
}

function getFriendlyError(error: string, code?: string, providerName?: string): { title: string; detail: string; tips: string[]; isCors?: boolean } {
  const provider = providerName || 'server';
  const lower = error.toLowerCase();

  // CORS / Proxy error
  if (code === 'CORS' || lower.includes('cors') || lower.includes('proxy server')) {
    return {
      title: 'Cần deploy lên Vercel để sử dụng',
      detail: `${provider} không cho phép gọi API trực tiếp từ trình duyệt (lỗi CORS). Cần một proxy server trung gian.`,
      tips: [
        'Deploy ứng dụng lên Vercel — proxy sẽ tự động hoạt động',
        'Hoặc chạy "vercel dev" ở local thay vì "npm run dev"',
        'OpenRouter hỗ trợ gọi trực tiếp, có thể chuyển sang dùng tạm',
      ],
      isCors: true,
    };
  }

  if (lower.includes('provider returned error') || lower.includes('upstream')) {
    return {
      title: 'Nhà cung cấp model đang gặp sự cố',
      detail: 'Server phía sau model này tạm thời quá tải hoặc không phản hồi.',
      tips: [
        'Nhấn "Thử lại" — thường sẽ được chuyển sang provider khác',
        'Chuyển sang model khác nếu lỗi lặp lại nhiều lần',
        'Model miễn phí thường bị giới hạn tài nguyên, hãy thử lại sau vài giây',
      ],
    };
  }

  if (lower.includes('rate limit') || lower.includes('429') || code === '429') {
    return {
      title: 'Bạn đã gửi quá nhiều yêu cầu',
      detail: `Đã vượt giới hạn số lượng request của ${provider}.`,
      tips: [
        'Đợi 10-30 giây rồi thử lại',
        'Model miễn phí có giới hạn thấp hơn model trả phí',
      ],
    };
  }

  if (lower.includes('api key') || lower.includes('unauthorized') || lower.includes('401') || code === '401') {
    return {
      title: 'API Key không hợp lệ',
      detail: `API Key của ${provider} bị sai hoặc đã hết hạn.`,
      tips: [
        'Kiểm tra lại API Key trong phần cài đặt',
        'Tạo key mới từ trang web của provider',
      ],
    };
  }

  if (lower.includes('context length') || lower.includes('too long') || lower.includes('token')) {
    return {
      title: 'Tin nhắn quá dài',
      detail: 'Cuộc hội thoại đã vượt quá giới hạn context của model.',
      tips: [
        'Tạo cuộc trò chuyện mới',
        'Chọn model có context length lớn hơn',
        'Giảm Max Tokens trong cài đặt',
      ],
    };
  }

  if (lower.includes('model not found') || lower.includes('not available') || code === '404') {
    return {
      title: 'Model không khả dụng',
      detail: `Model này hiện không có sẵn trên ${provider}.`,
      tips: [
        'Chọn model khác từ danh sách',
        'Nhấn nút làm mới để cập nhật danh sách model',
        'Model có thể đã bị gỡ hoặc đổi tên',
      ],
    };
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
    return {
      title: 'Lỗi kết nối mạng',
      detail: `Không thể kết nối đến ${provider}.`,
      tips: [
        'Kiểm tra kết nối internet của bạn',
        'Thử lại sau vài giây',
        `Nếu dùng ${provider} mà gặp lỗi liên tục, có thể do CORS — hãy deploy lên Vercel`,
      ],
    };
  }

  return {
    title: 'Đã xảy ra lỗi',
    detail: error,
    tips: [
      'Nhấn "Thử lại" để gửi lại tin nhắn',
      'Nếu lỗi lặp lại, hãy thử đổi model khác',
    ],
  };
}

export function ErrorBubble({ error, errorCode, onRetry, onSwitchModel, providerName }: ErrorBubbleProps) {
  const { title, detail, tips, isCors } = getFriendlyError(error, errorCode, providerName);

  return (
    <div className="py-3 sm:py-4 px-3 sm:px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className={`${isCors ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'} border rounded-xl p-4`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 ${isCors ? 'bg-amber-100' : 'bg-red-100'} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <AlertTriangle className={`w-5 h-5 ${isCors ? 'text-amber-500' : 'text-red-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold ${isCors ? 'text-amber-800' : 'text-red-800'} text-sm`}>{title}</h4>
              <p className={`${isCors ? 'text-amber-700' : 'text-red-700'} text-sm mt-1`}>{detail}</p>
              
              <ul className="mt-3 space-y-1">
                {tips.map((tip, i) => (
                  <li key={i} className={`text-xs ${isCors ? 'text-amber-600' : 'text-red-600'} flex items-start gap-1.5`}>
                    <span className="mt-0.5">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center gap-2 mt-4">
                {!isCors && (
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Thử lại
                  </button>
                )}
                {onSwitchModel && (
                  <button
                    onClick={onSwitchModel}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-sm rounded-lg border transition-colors
                      ${isCors ? 'text-amber-700 border-amber-300 hover:bg-amber-50' : 'text-red-700 border-red-300 hover:bg-red-50'}`}
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Đổi model
                  </button>
                )}
                {isCors && (
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Deploy lên Vercel
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
