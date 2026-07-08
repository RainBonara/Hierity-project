import React from 'react';

function InputSection({ resume, setResume, jobPosting, setJobPosting, onAnalyze, error, loading }) {
  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          AI가 분석하는 <span className="text-primary-600">직무 적합도</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          이력서와 채용 공고를 입력하면 AI가 적합도를 분석하고, 
          맞춤형 압박 면접 질문을 생성합니다.
        </p>
      </div>

      {/* Input Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Resume */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">이력서</h3>
          </div>
          <textarea
            className="textarea-field h-72"
            placeholder="이력서 내용을 붙여넣어 주세요.&#10;&#10;예시:&#10;- 이름, 학력, 경력&#10;- 보유 기술 및 자격증&#10;- 프로젝트 경험&#10;- 자기소개서 내용 등"
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            aria-label="이력서 입력란"
          />
          <p className="text-xs text-gray-400 mt-2">{resume.length}자 입력됨</p>
        </div>

        {/* Job Posting */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">채용 공고</h3>
          </div>
          <textarea
            className="textarea-field h-72"
            placeholder="채용 공고 내용을 붙여넣어 주세요.&#10;&#10;예시:&#10;- 회사명, 직무명&#10;- 주요 업무 내용&#10;- 자격 요건 (필수/우대)&#10;- 근무 조건 등"
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            aria-label="채용 공고 입력란"
          />
          <p className="text-xs text-gray-400 mt-2">{jobPosting.length}자 입력됨</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3" role="alert">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      <div className="text-center">
        <button
          className="btn-primary text-lg px-10 py-4"
          onClick={onAnalyze}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              AI 분석 중...
            </span>
          ) : (
            'AI 적합도 분석 시작'
          )}
        </button>
        <p className="text-xs text-gray-400 mt-3">
          Gemini AI가 이력서와 채용 공고를 종합적으로 비교 분석합니다
        </p>
      </div>

      {/* Features */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <FeatureCard
          icon="📊"
          title="적합도 분석"
          desc="직무 요구사항과 이력서를 매칭하여 백분율로 적합도를 산출합니다."
        />
        <FeatureCard
          icon="🎯"
          title="강점·약점 분석"
          desc="지원자의 강점과 보완이 필요한 영역을 구체적으로 제시합니다."
        />
        <FeatureCard
          icon="💬"
          title="압박 면접 질문"
          desc="이력서 기반 맞춤형 압박 면접 질문을 자동으로 생성합니다."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="text-center p-6 rounded-2xl bg-white border border-gray-100 hover:border-primary-200 transition-colors">
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

export default InputSection;
