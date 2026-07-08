import React from 'react';
import FitScoreCircle from './FitScoreCircle.jsx';

function ResultSection({ result, onReset }) {
  const { fitScore, summary, strengths, weaknesses, interviewQuestions, recommendations } = result;

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        새로운 분석하기
      </button>

      {/* Score Section */}
      <div className="card text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">직무 적합도 분석 결과</h2>
        <FitScoreCircle score={fitScore} />
        <p className="mt-6 text-gray-600 max-w-xl mx-auto">{summary}</p>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">강점 분석</h3>
          </div>
          <ul className="space-y-3">
            {strengths && strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-green-400 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">보완 필요 영역</h3>
          </div>
          <ul className="space-y-3">
            {weaknesses && weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Interview Questions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900">맞춤형 압박 면접 질문</h3>
          <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-medium">
            {interviewQuestions ? interviewQuestions.length : 0}개 질문
          </span>
        </div>
        <div className="space-y-4">
          {interviewQuestions && interviewQuestions.map((q, idx) => (
            <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                  <p className="text-xs text-gray-500">{q.intent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">개선 추천사항</h3>
          </div>
          <ul className="space-y-3">
            {recommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                <span className="text-sm text-gray-700">{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer Action */}
      <div className="text-center pb-8">
        <button onClick={onReset} className="btn-primary">
          새로운 분석 시작하기
        </button>
      </div>
    </div>
  );
}

export default ResultSection;
