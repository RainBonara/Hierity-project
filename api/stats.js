import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: 'Database not configured' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { period } = req.query; // 'day', '1month', '3months', '6months', '1year'

    // Determine date cutoff
    let daysBack = 30;
    switch (period) {
      case 'day': daysBack = 1; break;
      case '1month': daysBack = 30; break;
      case '3months': daysBack = 90; break;
      case '6months': daysBack = 180; break;
      case '1year': daysBack = 365; break;
      default: daysBack = 30; break;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffStr = cutoffDate.toISOString();

    // Total analyses (all time)
    const { count: totalAnalyses } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true });

    // Period analyses
    const { data: periodData, count: periodAnalyses } = await supabase
      .from('analyses')
      .select('fit_score, created_at', { count: 'exact' })
      .gte('created_at', cutoffStr)
      .order('created_at', { ascending: true });

    const scores = (periodData || []).map((d) => d.fit_score);
    const periodAverage = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Score distribution for period
    const scoreDistribution = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    scores.forEach((s) => {
      if (s <= 20) scoreDistribution['0-20']++;
      else if (s <= 40) scoreDistribution['21-40']++;
      else if (s <= 60) scoreDistribution['41-60']++;
      else if (s <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    });

    // Daily counts for the period
    const dailyCount = {};
    (periodData || []).forEach((d) => {
      const day = d.created_at.split('T')[0];
      dailyCount[day] = (dailyCount[day] || 0) + 1;
    });

    // Last updated
    const { data: lastEntry } = await supabase
      .from('analyses')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const lastUpdated = lastEntry && lastEntry.length > 0 ? lastEntry[0].created_at : null;

    return res.status(200).json({
      totalAnalyses: totalAnalyses || 0,
      periodAnalyses: periodAnalyses || 0,
      averageScore: periodAverage,
      scoreDistribution,
      dailyCount,
      period: period || '1month',
      lastUpdated,
      privacyNote: '이 통계에는 개인식별정보가 포함되어 있지 않습니다. 적합도 점수의 익명 집계 데이터만 표시됩니다.',
    });
  } catch (error) {
    console.error('Stats error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
