import React, { useState } from 'react';

function Header({ currentPage, onNavigate, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">HR Intelligence</h1>
              <p className="text-xs text-gray-500 -mt-0.5 hidden sm:block">이력서-채용 적합도 분석기</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {/* Nav Links */}
            <NavButton
              label="분석"
              active={currentPage === 'home'}
              onClick={() => onNavigate('home')}
            />
            <NavButton
              label="대시보드"
              active={currentPage === 'dashboard'}
              onClick={() => onNavigate('dashboard')}
            />
            {user && (
              <NavButton
                label="내 이력"
                active={currentPage === 'history' || currentPage === 'detail'}
                onClick={() => onNavigate('history')}
              />
            )}

            {/* User Area */}
            {user ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-700">
                      {user.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-400">로그인됨</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setMenuOpen(false); onNavigate('history'); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        내 분석 이력
                      </button>
                      <button
                        onClick={() => { setMenuOpen(false); onLogout(); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        로그아웃
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => onNavigate('auth')}
                className="ml-2 text-sm px-4 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                로그인
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-lg transition-colors hidden sm:block ${
        active
          ? 'bg-primary-50 text-primary-700 font-medium'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

export default Header;
