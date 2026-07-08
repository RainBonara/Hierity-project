import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';
import Header from './components/Header.jsx';
import AuthPage from './components/AuthPage.jsx';
import InputSection from './components/InputSection.jsx';
import ResultSection from './components/ResultSection.jsx';
import Dashboard from './components/Dashboard.jsx';
import MyAnalyses from './components/MyAnalyses.jsx';
import AnalysisDetail from './components/AnalysisDetail.jsx';
import LoadingOverlay from './components/LoadingOverlay.jsx';
import Footer from './components/Footer.jsx';

function App() {
  // Auth state
  const [user, setUser] = useState(undefined); // undefined = loading, null = guest
  const [authChecked, setAuthChecked] = useState(false);

  // Page state: 'auth' | 'home' | 'dashboard' | 'history' | 'detail'
  const [page, setPage] = useState('home');
  const [detailId, setDetailId] = useState(null);

  // Analysis state
  const [resume, setResume] = useState('');
  const [jobPosting, setJobPosting] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check auth on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user && page === 'auth') {
        setPage('home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAnalyze = async () => {
    if (!resume.trim() || !jobPosting.trim()) {
      setError('이력서와 채용 공고를 모두 입력해 주세요.');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      // Get current session token for authenticated requests
      const { data: { session } } = await supabase.auth.getSession();
      const headers = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ resume, jobPosting }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || '분석 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || '서버 연결에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResume('');
    setJobPosting('');
    setResult(null);
    setError('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setPage('home');
    setResult(null);
  };

  const handleAuthSuccess = (authUser) => {
    setUser(authUser);
    setPage('home');
  };

  const handleViewDetail = (id) => {
    setDetailId(id);
    setPage('detail');
  };

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderPage = () => {
    if (page === 'auth') {
      return <AuthPage onAuthSuccess={handleAuthSuccess} />;
    }

    if (page === 'dashboard') {
      return <Dashboard onBack={() => setPage('home')} />;
    }

    if (page === 'history') {
      if (!user) {
        setPage('auth');
        return null;
      }
      return (
        <MyAnalyses
          user={user}
          onBack={() => setPage('home')}
          onViewDetail={handleViewDetail}
        />
      );
    }

    if (page === 'detail') {
      if (!user) {
        setPage('auth');
        return null;
      }
      return (
        <AnalysisDetail
          analysisId={detailId}
          user={user}
          onBack={() => setPage('history')}
        />
      );
    }

    // Home page
    if (result) {
      return <ResultSection result={result} onReset={handleReset} />;
    }

    return (
      <InputSection
        resume={resume}
        setResume={setResume}
        jobPosting={jobPosting}
        setJobPosting={setJobPosting}
        onAnalyze={handleAnalyze}
        error={error}
        loading={loading}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        currentPage={page}
        onNavigate={setPage}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
      <Footer />
      {loading && <LoadingOverlay />}
    </div>
  );
}

export default App;
