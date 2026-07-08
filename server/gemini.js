import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

export async function analyzeResumeFit(resume, jobPosting) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
      maxOutputTokens: 4096,
    },
  });

  const userPrompt = `## 이력서
${resume}

## 채용 공고
${jobPosting}

위 이력서와 채용 공고를 비교 분석하여 직무 적합도를 평가하고, 압박 면접 질문을 생성해 주세요.`;

  const result = await model.generateContent(ANALYSIS_PROMPT + '\n\n' + userPrompt);

  const response = result.response;
  const text = response.text();

  // Parse JSON from response (handle potential markdown code blocks)
  let jsonStr = text;
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  } else {
    // Try to extract JSON directly
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      jsonStr = text.slice(startIdx, endIdx + 1);
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate and sanitize the response
    return {
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
  } catch (parseError) {
    console.error('JSON parse error:', parseError.message);
    console.error('Raw response:', text.substring(0, 500));
    throw new Error('AI 응답 파싱에 실패했습니다. 다시 시도해 주세요.');
  }
}
