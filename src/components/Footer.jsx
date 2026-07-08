import React from 'react';

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            AI HR Intelligence &copy; {new Date().getFullYear()}. Powered by Gemini AI.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>개인정보는 분석 후 즉시 삭제됩니다</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span>데이터 미저장</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
