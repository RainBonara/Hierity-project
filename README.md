# Hirely - AI 이력서 적합도 분석기

이력서와 채용 공고를 AI로 비교 분석하여 직무 적합도를 평가하고, 압박 면접 예상 질문을 생성하는 웹 애플리케이션입니다.

## 주요 기능

- **적합도 분석**: 이력서와 채용 공고를 비교하여 0~100점 적합도 점수 산출
- **강점/약점 분석**: 채용 공고 대비 지원자의 경쟁력과 보완점 도출
- **압박 면접 질문 생성**: 이력서의 약점과 모호한 부분을 파고드는 면접 질문 7개 생성
- **개선 추천사항**: 합격 확률을 높이기 위한 구체적인 조언 제공
- **분석 이력 관리**: 회원가입 후 분석 결과 저장 및 조회
- **대시보드**: 분석 통계 확인

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18, Tailwind CSS, Vite |
| Backend | Express.js (로컬 개발) / Vercel Serverless Functions (배포) |
| AI | Google Gemini 2.5 Flash |
| 인증 & DB | Supabase (Auth + PostgreSQL) |
| 배포 | Vercel |

## 프로젝트 구조

```
Hirely/
├── api/                    # Vercel Serverless Functions
│   ├── analyze.js          # 이력서 분석 API
│   ├── health.js           # 헬스체크
│   └── stats.js            # 통계 API
├── server/                 # 로컬 개발용 Express 서버
│   ├── index.js
│   └── gemini.js
├── src/
│   ├── components/         # React 컴포넌트
│   │   ├── AnalysisDetail.jsx
│   │   ├── AuthPage.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FitScoreCircle.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── InputSection.jsx
│   │   ├── LoadingOverlay.jsx
│   │   ├── MyAnalyses.jsx
│   │   └── ResultSection.jsx
│   ├── lib/
│   │   └── supabase.js     # Supabase 클라이언트 설정
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json
└── supabase-setup.sql      # DB 스키마 설정 SQL
```

## 시작하기

### 사전 요구사항

- Node.js 18+
- npm
- [Google AI Studio](https://aistudio.google.com/) API 키
- [Supabase](https://supabase.com/) 프로젝트

### 설치

```bash
# 저장소 클론
git clone <repository-url>
cd Hirely

# 의존성 설치
npm install
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env.local` 파일을 생성합니다.

```env
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase (Server-side)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Supabase (Client-side)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Supabase 설정

Supabase 대시보드의 SQL Editor에서 `supabase-setup.sql` 파일의 내용을 실행합니다.

### 로컬 개발

```bash
# 프론트엔드 + 백엔드 동시 실행
npm run dev:all

# 또는 개별 실행
npm run dev      # Vite 프론트엔드 (기본 포트: 5173)
npm run server   # Express 백엔드 (기본 포트: 5000)
```

### 빌드

```bash
npm run build
```

## 배포

Vercel에 배포되어 있으며, `api/` 디렉토리의 Serverless Functions가 백엔드 역할을 합니다.

Vercel 대시보드에서 환경 변수를 설정한 후 배포합니다.

## 분석 평가 기준

| 항목 | 가중치 |
|------|--------|
| 기술 역량 매칭 | 35% |
| 경력 적합성 | 25% |
| 직무 이해도 | 20% |
| 학력 및 자격 | 10% |
| 성장 가능성 | 5% |
| 문화 적합성 | 5% |

## 개인정보 보호

- 이력서와 채용 공고 원문은 저장하지 않습니다
- 분석 결과(점수, 강점, 질문 등)만 저장됩니다
- Row Level Security(RLS)로 본인 데이터만 접근 가능

## 라이선스

Private
