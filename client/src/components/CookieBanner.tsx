import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp, Settings } from "lucide-react";
import { Link } from "wouter";

const COOKIE_KEY = "rvn_cookie_consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [essentialOpen, setEssentialOpen] = useState(false);
  const [nonEssentialOpen, setNonEssentialOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-6 duration-500 ease-out"
      role="dialog"
      aria-label="Cookie consent"
      data-testid="banner-cookie-consent"
      style={{ maxWidth: showDetails ? "420px" : "380px" }}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

        {!showDetails ? (
          <>
            <div className="p-5 pb-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white" data-testid="text-cookie-title">
                  We use cookies!
                </h3>
                <button
                  onClick={decline}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-0.5 -mt-0.5 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  aria-label="Dismiss"
                  data-testid="button-cookie-dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                We use cookies on this website to give you the best experience. Please accept or reject cookies below.
              </p>
            </div>

            <div className="px-5 pb-5 flex items-center gap-2">
              <button
                onClick={accept}
                className="px-5 py-2.5 bg-[#2C3E50] hover:bg-[#1a2a3a] text-white text-sm font-semibold rounded-lg transition-colors"
                data-testid="button-cookie-accept"
              >
                Yes, I accept
              </button>
              <button
                onClick={decline}
                className="px-5 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                data-testid="button-cookie-decline"
              >
                No, thank you
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="px-4 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center gap-1.5"
                data-testid="button-cookie-more-info"
              >
                More info
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Cookies
                </h3>
                <button
                  onClick={decline}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 -mt-0.5 -mr-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  aria-label="Close"
                  data-testid="button-cookie-close-details"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use cookies on this website to give you the best experience. You can read more about our cookies and privacy settings in detail below.
              </p>

              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => setEssentialOpen(!essentialOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  data-testid="button-cookie-essential-toggle"
                >
                  <div className="flex items-center gap-2.5">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Essential cookies</span>
                  </div>
                  {essentialOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </button>
                {essentialOpen && (
                  <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3 mb-2">
                      Necessary cookies are essential for the website to function properly.
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 ml-1">
                      <li className="flex items-start gap-2">
                        <span className="text-[#2C3E50] dark:text-[#C9A961] mt-0.5">&#8226;</span>
                        <span><strong>Accounts:</strong> We use accounts to allow our users to login to our website and to manage their data.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#2C3E50] dark:text-[#C9A961] mt-0.5">&#8226;</span>
                        <span><strong>Sessions:</strong> We use session cookies to keep you logged in and remember your cart items.</span>
                      </li>
                    </ul>
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setNonEssentialOpen(!nonEssentialOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    data-testid="button-cookie-nonessential-toggle"
                  >
                    <div className="flex items-center gap-2.5">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Non-essential cookies</span>
                    </div>
                    {nonEssentialOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  {nonEssentialOpen && (
                    <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-3 mb-2">
                        These cookies help us improve the website experience and show you relevant content.
                      </p>
                      <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5 ml-1">
                        <li className="flex items-start gap-2">
                          <span className="text-[#2C3E50] dark:text-[#C9A961] mt-0.5">&#8226;</span>
                          <span><strong>Analytics:</strong> We collect anonymous data to understand how visitors use our website.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2C3E50] dark:text-[#C9A961] mt-0.5">&#8226;</span>
                          <span><strong>Preferences:</strong> We remember your preferences like recently viewed products and wishlist.</span>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 flex items-center gap-2">
              <button
                onClick={accept}
                className="flex-1 px-5 py-2.5 bg-[#2C3E50] hover:bg-[#1a2a3a] text-white text-sm font-semibold rounded-lg transition-colors"
                data-testid="button-cookie-accept-all"
              >
                Accept all
              </button>
              <button
                onClick={decline}
                className="flex-1 px-5 py-2.5 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-lg border border-gray-300 dark:border-gray-600 transition-colors"
                data-testid="button-cookie-reject-all"
              >
                Reject all
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
