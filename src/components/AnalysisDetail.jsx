import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import ResultSection from './ResultSection.jsx';

function AnalysisDetail({ analysisId, user, onBack }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetail();
  }, [analysisId]);

  const fetchDetail = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', analysisId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      setResult({
        fitScore: data.fit_score,
        summary: data.summary,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        interviewQuestions: data.interview_questions || [],
        recommendations: data.recommendations || [],
      });
    } catch (err) {
      setError('분석 결과를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:underline">돌아가기</button>
      </div>
    );
  }

  return <ResultSection result={result} onReset={onBack} />;
}

export default AnalysisDetail;
