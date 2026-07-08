import React, { useEffect, useState } from 'react';

const PERIODS = [
  { key: 'day', label: '오늘' },
  { key: '1month', label: '1개월' },
  { key: '3months', label: '3개월' },
  { key: '6months', label: '6개월' },
  { key: '1year', label: '1년' },
];

function Dashboard({ onBack }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('1month');

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const fetchStats = async (p) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats?period=${p}`);
      if (!res.ok) throw new Error('통계 조회 실패');
      const data = await res.json();
      setStats(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (error && !stats) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500">{error}</p>
        <button onClick={onBack} className="mt-4 text-primary-600 hover:underline">
          돌아가기
        </button>
      </div>
    );
  }

  const distribution = stats?.scoreDistribution || {};
  const maxCount = Math.max(...Object.values(distribution), 1);
  const dailyCount = stats?.dailyCount || {};
  const dailyEntries = Object.entries(dailyCount).sort((a, b) => a[0].localeCompare(b[0]));
  const maxDaily = Math.max(...dailyEntries.map(([, v]) => v), 1);

  // For long periods, group by week or month
  const chartEntries = groupEntries(dailyEntries, period);
  const maxChart = Math.max(...chartEntries.map(([, v]) => v), 1);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        분석하기로 돌아가기
      </button>

      {/* Title + Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">분석 통계 대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">
            익명 집계 데이터만 표시됩니다. 개인식별정보는 수집하지 않습니다.
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                period === p.key
                  ? 'bg-white text-primary-700 font-medium shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <StatCard
              label="전체 분석 횟수"
              value={stats.totalAnalyses}
              icon={
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
              }
              color="gray"
            />
            <StatCard
              label={`기간 내 분석`}
              value={stats.periodAnalyses}
              icon={
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              color="primary"
            />
            <StatCard
              label="평균 적합도"
              value={`${stats.averageScore}%`}
              icon={
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              }
              color="green"
            />
            <StatCard
              label="최근 업데이트"
              value={stats.lastUpdated ? formatDate(stats.lastUpdated) : '-'}
              icon={
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="purple"
            />
          </div>

          {/* Score Distribution Chart */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-1">적합도 점수 분포</h3>
            <p className="text-xs text-gray-400 mb-4">선택 기간 내 분석 결과 분포</p>
            <div className="space-y-3">
              {Object.entries(distribution).map(([range, count]) => (
                <div key={range} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-20 flex-shrink-0">{range}%</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out flex items-center"
                      style={{
                        width: `${Math.max((count / maxCount) * 100, count > 0 ? 8 : 0)}%`,
                        backgroundColor: getBarColor(range),
                      }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-medium text-white ml-3">{count}건</span>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">{count}건</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily/Period Trend Chart */}
          {chartEntries.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-1">분석 추이</h3>
              <p className="text-xs text-gray-400 mb-4">
                {period === 'day' ? '오늘' : period === '1month' ? '최근 30일 (일별)' : period === '3months' ? '최근 3개월 (주별)' : period === '6months' ? '최근 6개월 (주별)' : '최근 1년 (월별)'}
              </p>
              <div className="flex items-end gap-1 h-44 overflow-x-auto pb-2">
                {chartEntries.map(([label, count], idx) => (
                  <div key={idx} className="flex-1 min-w-[24px] max-w-[48px] flex flex-col items-center gap-1">
                    <span className="text-xs font-medium text-gray-700">{count > 0 ? count : ''}</span>
                    <div
                      className="w-full bg-primary-500 rounded-t-md transition-all duration-500 hover:bg-primary-600"
                      style={{
                        height: `${count > 0 ? Math.max((count / maxChart) * 100, 5) : 2}%`,
                        minHeight: count > 0 ? '4px' : '2px',
                      }}
                    ></div>
                    <span className="text-xs text-gray-400 mt-1 whitespace-nowrap">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No data state */}
          {chartEntries.length === 0 && stats.periodAnalyses === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-700 mb-1">아직 데이터가 없습니다</h3>
              <p className="text-sm text-gray-500">선택한 기간에 분석 기록이 없습니다. 분석을 실행하면 여기에 통계가 표시됩니다.</p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-800">개인정보 보호 안내</h4>
              <p className="text-xs text-green-700 mt-1">
                본 대시보드는 적합도 점수의 익명 집계 데이터만 표시합니다.
                이력서, 채용 공고 원문, IP 주소, 사용자 식별 정보는 일체 저장하지 않습니다.
                데이터는 최대 1년간 보관 후 자동 삭제됩니다.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const bgColors = {
    primary: 'bg-blue-50',
    green: 'bg-green-50',
    purple: 'bg-purple-50',
    gray: 'bg-gray-50',
  };

  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bgColors[color]} flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function getBarColor(range) {
  const colors = {
    '0-20': '#ef4444',
    '21-40': '#f59e0b',
    '41-60': '#3b82f6',
    '61-80': '#22c55e',
    '81-100': '#10b981',
  };
  return colors[range] || '#6b7280';
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Group daily entries by week or month depending on period
function groupEntries(dailyEntries, period) {
  if (dailyEntries.length === 0) return [];

  // For day and 1month: show daily
  if (period === 'day' || period === '1month') {
    return dailyEntries.map(([date, count]) => {
      const parts = date.split('-');
      return [`${parseInt(parts[1])}/${parseInt(parts[2])}`, count];
    });
  }

  // For 3months, 6months: group by week
  if (period === '3months' || period === '6months') {
    const weeks = {};
    dailyEntries.forEach(([date, count]) => {
      const d = new Date(date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];
      weeks[key] = (weeks[key] || 0) + count;
    });
    return Object.entries(weeks).sort().map(([date, count]) => {
      const parts = date.split('-');
      return [`${parseInt(parts[1])}/${parseInt(parts[2])}`, count];
    });
  }

  // For 1year: group by month
  if (period === '1year') {
    const months = {};
    dailyEntries.forEach(([date, count]) => {
      const key = date.substring(0, 7); // YYYY-MM
      months[key] = (months[key] || 0) + count;
    });
    return Object.entries(months).sort().map(([ym, count]) => {
      const parts = ym.split('-');
      return [`${parseInt(parts[1])}월`, count];
    });
  }

  return dailyEntries;
}

export default Dashboard;
