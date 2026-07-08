import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const ANALYSIS_PROMPT = `당신은 15년 경력의 시니어 HR 전문가이자 채용 컨설턴트입니다.
지원자의 이력서와 회사의 채용 공고를 비교 분석하여 직무 적합도를 평가하고, 면접 질문을 생성하는 역할을 합니다.

## 분석 기준 (평가 요소)
1. **기술 역량 매칭**: 채용 공고에서 요구하는 기술/스킬과 이력서에 기재된 기술의 일치도
2. **경력 적합성**: 요구 경력 연차, 관련 업무 경험, 프로젝트 연관성
3. **학력 및 자격**: 학력 요건 충족 여부, 관련 자격증/인증
4. **직무 이해도**: 해당 직무에 대한 이해와 관련 성과/경험
5. **성장 가능성**: 학습 이력, 자기개발 활동, 잠재적 기여도
6. **문화 적합성**: 조직 문화와의 적합성 단서 (협업 경험, 커뮤니케이션 등)

## 분석 수행 규칙
- 적합도는 0~100 사이의 정수로 산출하되, 아래 가중치를 적용합니다:
  - 기술 역량 매칭: 35%
  - 경력 적합성: 25%
  - 직무 이해도: 20%
  - 학력 및 자격: 10%
  - 성장 가능성: 5%
  - 문화 적합성: 5%
- 강점은 채용 공고 대비 이력서의 경쟁력 있는 부분을 3~5개 도출합니다.
- 약점은 부족하거나 보완이 필요한 영역을 3~5개 도출합니다.
- 면접 질문은 반드시 "압박 면접" 스타일로, 이력서의 약점/모호한 부분/과장 가능성을 파고드는 질문 7개를 생성합니다.
- 각 면접 질문에는 해당 질문의 출제 의도를 함께 제시합니다.
- 개선 추천사항은 합격 확률을 높이기 위한 구체적인 조언 3~5개를 제시합니다.

## 출력 형식 (반드시 아래 JSON 형식을 준수하세요)
{
  "fitScore": <0~100 정수>,
  "summary": "<2~3문장의 종합 평가 요약>",
  "strengths": ["<강점1>", "<강점2>", ...],
  "weaknesses": ["<약점1>", "<약점2>", ...],
  "interviewQuestions": [
    {"question": "<압박 면접 질문>", "intent": "<출제 의도>"},
    ...
  ],
  "recommendations": ["<추천1>", "<추천2>", ...]
}

중요: 반드시 유효한 JSON만 출력하세요. 마크다운 코드블록이나 설명 텍스트 없이 순수 JSON만 응답해야 합니다.`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { resume, jobPosting } = req.body;

    if (!resume || !jobPosting) {
      return res.status(400).json({ error: '이력서와 채용 공고를 모두 입력해 주세요.' });
    }

    if (resume.length > 50000 || jobPosting.length > 50000) {
      return res.status(400).json({ error: '입력 텍스트가 너무 깁니다. 50,000자 이내로 입력해 주세요.' });
    }

    // Gemini API call
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI 서비스가 설정되지 않았습니다.' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const userPrompt = `## 이력서\n${resume}\n\n## 채용 공고\n${jobPosting}\n\n위 이력서와 채용 공고를 비교 분석하여 직무 적합도를 평가하고, 압박 면접 질문을 생성해 주세요.`;

    const result = await model.generateContent(ANALYSIS_PROMPT + '\n\n' + userPrompt);
    const response = result.response;
    const text = response.text();
    const parsed = JSON.parse(text);

    const analysisResult = {
      fitScore: Math.min(100, Math.max(0, parseInt(parsed.fitScore) || 0)),
      summary: parsed.summary || '분석 결과를 생성할 수 없습니다.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      interviewQuestions: Array.isArray(parsed.interviewQuestions)
        ? parsed.interviewQuestions.map((q) => ({
            question: q.question || '',
            intent: q.intent || '',
          }))
        : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
    };

    // Save to Supabase if user is authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(
          process.env.SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Verify the user's JWT token
        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (user && !authError) {
          await supabase.from('analyses').insert({
            user_id: user.id,
            fit_score: analysisResult.fitScore,
            summary: analysisResult.summary,
            strengths: analysisResult.strengths,
            weaknesses: analysisResult.weaknesses,
            interview_questions: analysisResult.interviewQuestions,
            recommendations: analysisResult.recommendations,
          });
        }
      } catch (dbError) {
        // DB save failure should not affect the response
        console.error('DB save error:', dbError.message);
      }
    }

    return res.status(200).json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error.message);
    return res.status(500).json({ error: '[DEBUG] ' + error.message });
  }
}
