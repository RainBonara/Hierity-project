import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';

function MyAnalyses({ user, onBack, onViewDetail }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('analyses')
        .select('id, fit_score, summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setAnalyses(data || []);
    } catch (err) {
      setError('분석 이력을 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('이 분석 결과를 삭제하시겠습니까?')) return;

    const { error: delError } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!delError) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        돌아가기
      </button>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">내 분석 이력</h2>
        <p className="text-sm text-gray-500 mt-1">이전에 분석한 결과들을 다시 확인할 수 있습니다.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {analyses.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <h3 className="font-semibold text-gray-700 mb-1">분석 이력이 없습니다</h3>
          <p className="text-sm text-gray-500">AI 적합도 분석을 실행하면 여기에 결과가 저장됩니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="card flex items-center gap-4 hover:border-primary-200 transition-colors cursor-pointer"
              onClick={() => onViewDetail(analysis.id)}
            >
              {/* Score Badge */}
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${getScoreColor(analysis.fit_score)}`}>
                <span className="text-lg font-bold">{analysis.fit_score}%</span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-medium truncate">
                  {analysis.summary || '분석 결과'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(analysis.created_at).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(analysis.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                aria-label="삭제"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyAnalyses;
