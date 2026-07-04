import { useState, useEffect } from 'react';
import { X, Download, Share, Plus } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type Platform = 'android' | 'ios' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  if (/windows|macintosh|linux/.test(ua)) return 'desktop';
  return 'unknown';
}

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already installed
    if (isStandalone()) return;

    // Already dismissed
    const wasDismissed = localStorage.getItem('install-dismissed');
    if (wasDismissed) {
      const dismissedAt = parseInt(wasDismissed);
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    const p = detectPlatform();
    setPlatform(p);

    // Android/Desktop: Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS: Show custom instructions after 3s
    if (p === 'ios') {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handler);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    localStorage.setItem('install-dismissed', Date.now().toString());
  };

  if (!showBanner || dismissed || isStandalone()) return null;

  // iOS instructions
  if (platform === 'ios') {
    return (
      <>
        {/* Compact banner */}
        {!showIOSGuide && (
          <div className="fixed bottom-20 left-3 right-3 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-slide-up">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Cài đặt AI Chat</p>
                <p className="text-xs text-slate-500">Truy cập nhanh từ màn hình chính</p>
              </div>
              <button
                onClick={() => setShowIOSGuide(true)}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg flex-shrink-0"
              >
                Hướng dẫn
              </button>
              <button onClick={handleDismiss} className="p-1 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Full iOS guide modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Cài đặt trên iPhone</h3>
                <button onClick={() => { setShowIOSGuide(false); handleDismiss(); }} className="p-1">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-sm">Nhấn nút Chia sẻ</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Share className="w-5 h-5 text-blue-500" />
                      <span className="text-xs text-slate-500">ở thanh dưới cùng của Safari</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-sm">Chọn "Thêm vào MH chính"</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Plus className="w-5 h-5 text-slate-600 border rounded p-0.5" />
                      <span className="text-xs text-slate-500">cuộn xuống nếu chưa thấy</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-blue-600">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-sm">Nhấn "Thêm"</p>
                    <span className="text-xs text-slate-500">Biểu tượng sẽ xuất hiện trên MH chính</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setShowIOSGuide(false); handleDismiss(); }}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                Đã hiểu!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Android & Desktop: Native install prompt
  if (deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-4 sm:bottom-4 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 animate-slide-up">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Cài đặt AI Chat</p>
            <p className="text-xs text-slate-500">Truy cập nhanh từ màn hình chính</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg flex-shrink-0"
          >
            Cài đặt
          </button>
          <button onClick={handleDismiss} className="p-1 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
