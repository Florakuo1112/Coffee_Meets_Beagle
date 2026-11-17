import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Sparkles, User, Menu, X, PawPrint, LogOut } from "lucide-react";

export default function Header({ user, onSignOut }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "AI 探索毛孩",
      onClick: () => navigate({ to: "/explore" }),
      isHot: true,
    },
    { name: "契合度分析表", onClick: () => navigate({ to: "/ai-match" }) },
    {
      name: "送養專區(愛爸愛媽請進)",
      onClick: () => navigate({ to: "/foster-dashboard" }),
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-pink-100 bg-gradient-to-l from-white via-pink-50 to-pink-100/70 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 1. 左側：品牌 Logo 區 */}
          <a
            onClick={() => navigate({ to: "/" })}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20 group-hover:scale-105 transition-transform">
              <PawPrint className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-slate-800 leading-none">
                Coffee Meets <span className="text-pink-500">Beagle</span>
              </span>
              <span className="text-[11px] font-medium text-slate-400 tracking-wider mt-0.5">
                AI PET MATCHING
              </span>
            </div>
          </a>

          {/* 2. 中間：桌面版導覽連結 */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                onClick={link.onClick}
                className="relative text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors flex items-center gap-1.5 py-2"
              >
                {link.name}
                {link.isHot && (
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-500 border border-pink-200">
                    <Sparkles className="w-3 h-3" />
                    AI
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* 3. 右側：會員互動 / CTA 按鈕區 */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              // 已登入狀態
              <div className="flex items-center gap-3">
                <a
                  onClick={() => navigate({ to: "/profile" })}
                  className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-slate-200 hover:border-pink-300 hover:bg-pink-50/50 transition-all"
                >
                  <img
                    src={
                      user.avatar_url ||
                      "https://api.dicebear.com/7.x/avataaars/svg?seed=Beagle"
                    }
                    alt="User Avatar"
                    className="w-7 h-7 rounded-full object-cover bg-pink-100"
                  />
                  <span className="text-sm font-semibold text-slate-700 max-w-[100px] truncate">
                    {user.name || "認養人檔案"}
                  </span>
                </a>

                <button
                  onClick={onSignOut}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // 未登入狀態
              <>
                <a
                  onClick={() => navigate({ to: "/login" })}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-pink-500 transition-colors"
                >
                  登入
                </a>
                <a
                  onClick={() => navigate({ to: "/register" })}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-full shadow-md shadow-pink-500/25 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  免費註冊
                </a>
              </>
            )}
          </div>

          {/* 手機版漢堡選單按鈕 */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-pink-500 hover:bg-pink-50 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 手機版展開抽屜選單 */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-pink-100 px-4 pt-2 pb-5 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <a
              key={link.name}
              onClick={link.onClick}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:text-pink-500 hover:bg-pink-50 transition-colors"
            >
              <span>{link.name}</span>
              {link.isHot && (
                <span className="px-2 py-0.5 text-xs font-bold bg-pink-500 text-white rounded-full">
                  AI 推薦
                </span>
              )}
            </a>
          ))}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <a
                  onClick={() => navigate({ to: "/profile" })}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-700 hover:bg-pink-50"
                >
                  <User className="w-5 h-5 text-pink-500" />
                  編輯個人與理想寵物條件
                </a>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold text-rose-500 hover:bg-rose-50 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  登出帳號
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  onClick={() => navigate({ to: "/login" })}
                  className="py-2.5 text-center text-sm font-bold text-pink-500 bg-pink-50 rounded-xl"
                >
                  登入
                </a>
                <a
                  onClick={() => navigate({ to: "/register" })}
                  className="py-2.5 text-center text-sm font-bold text-white bg-pink-500 rounded-xl shadow-sm"
                >
                  免費註冊
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
