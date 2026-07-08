# Hirely - 시스템 아키텍처

## 전체 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Client (Browser)                          │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                     React 18 + Vite SPA                       │  │
│  │                                                               │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │AuthPage │  │InputSection│ │ResultSection│ │  Dashboard  │  │  │
│  │  └────┬────┘  └─────┬────┘  └──────────┘  └──────┬───────┘  │  │
│  │       │              │                            │           │  │
│  │       │              │         ┌──────────────────┘           │  │
│  │       ▼              ▼         ▼                              │  │
│  │  ┌─────────────────────────────────┐                         │  │
│  │  │      Supabase Client SDK        │                         │  │
│  │  │   (Auth + Direct DB Queries)    │                         │  │
│  │  └─────────────┬───────────────────┘                         │  │
│  └────────────────┼──────────────────────────────────────────────┘  │
│                   │                                                  │
└───────────────────┼──────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────────────────────┐
        │           │                           │
        ▼           ▼                           ▼
┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐
│  Supabase    │  │  Vercel Edge    │  │   Google Cloud   │
│              │  │  (Serverless)   │  │                  │
│ ┌──────────┐ │  │                 │  │ ┌──────────────┐ │
│ │   Auth   │ │  │ ┌─────────────┐│  │ │Gemini 2.5    │ │
│ │  Service │ │  │ │/api/analyze ││  │ │   Flash      │ │
│ └──────────┘ │  │ │             ├┼──┼─┤              │ │
│              │  │ └─────────────┘│  │ │ (AI Analysis)│ │
│ ┌──────────┐ │  │                 │  │ └──────────────┘ │
│ │PostgreSQL│ │  │ ┌─────────────┐│  │                  │
│ │    DB    │ │  │ │/api/stats   ││  └──────────────────┘
│ │          │◀┼──┼─┤             ││
│ │(analyses)│ │  │ └─────────────┘│
│ └──────────┘ │  │                 │
│              │  │ ┌─────────────┐│
│ ┌──────────┐ │  │ │/api/health  ││
│ │   RLS    │ │  │ └─────────────┘│
│ │ Policies │ │  │                 │
│ └──────────┘ │  └─────────────────┘
└──────────────┘
```

## 계층 구조

### 1. 프레젠테이션 계층 (Frontend)

```
src/
├── App.jsx                    # 라우팅 및 전역 상태 관리
├── main.jsx                   # 앱 엔트리포인트
├── index.css                  # Tailwind CSS 설정
├── lib/
│   └── supabase.js            # Supabase 클라이언트 초기화
└── components/
    ├── Header.jsx             # 네비게이션 바
    ├── AuthPage.jsx           # 로그인/회원가입
    ├── InputSection.jsx       # 이력서 & 채용공고 입력 폼
    ├── LoadingOverlay.jsx     # 분석 중 로딩 UI
    ├── ResultSection.jsx      # 분석 결과 표시
    ├── FitScoreCircle.jsx     # 적합도 점수 원형 차트
    ├── Dashboard.jsx          # 통계 대시보드
    ├── MyAnalyses.jsx         # 분석 이력 목록
    ├── AnalysisDetail.jsx     # 분석 상세 보기
    └── Footer.jsx             # 푸터
```

### 2. API 계층 (Backend)

```
api/                           # Vercel Serverless Functions (배포용)
├── analyze.js                 # POST /api/analyze - AI 분석 실행
├── stats.js                   # GET  /api/stats   - 통계 조회
└── health.js                  # GET  /api/health  - 헬스체크

server/                        # Express Server (로컬 개발용)
├── index.js                   # Express 앱 설정 + 라우팅
└── gemini.js                  # Gemini AI 호출 로직
```

### 3. 데이터 계층 (Database)

```
Supabase PostgreSQL
└── analyses 테이블
    ├── id (UUID, PK)
    ├── user_id (FK → auth.users)
    ├── fit_score (INTEGER, 0-100)
    ├── summary (TEXT)
    ├── strengths (JSONB)
    ├── weaknesses (JSONB)
    ├── interview_questions (JSONB)
    ├── recommendations (JSONB)
    └── created_at (TIMESTAMPTZ)
```

## 데이터 흐름

### 이력서 분석 흐름

```
사용자 입력          API 호출              AI 분석              결과 저장
─────────────────────────────────────────────────────────────────────────

[이력서 + 채용공고]
       │
       ▼
  InputSection ──POST /api/analyze──▶ Vercel Function
                                          │
                                          ├─ 입력 유효성 검사
                                          │
                                          ▼
                                    Gemini 2.5 Flash
                                          │
                                          ├─ 프롬프트 구성
                                          ├─ JSON 응답 생성
                                          │
                                          ▼
                                     결과 파싱
                                          │
                              ┌────────────┼────────────┐
                              │            │            │
                              ▼            ▼            ▼
                        (인증된 사용자)  클라이언트    (비인증)
                              │         응답 반환       │
                              ▼            │            │
                        Supabase DB        │            │
                        (analyses)         │            │
                              │            │            │
                              └────────────┼────────────┘
                                           ▼
                                     ResultSection
                                    (결과 렌더링)
```

### 인증 흐름

```
[사용자] ──▶ AuthPage ──▶ Supabase Auth ──▶ JWT 발급
                                               │
                                               ▼
                                    localStorage에 세션 저장
                                               │
                                               ▼
                              API 요청 시 Authorization 헤더에 포함
                                               │
                                               ▼
                              Serverless Function에서 JWT 검증
                                               │
                                               ▼
                                    사용자 ID 기반 DB 저장
```

## 배포 아키텍처

```
┌─────────────────────────────────────────────┐
│                  Vercel                       │
│                                             │
│  ┌────────────────────────────────────────┐ │
│  │           CDN (Edge Network)           │ │
│  │                                        │ │
│  │   Static Assets (dist/)                │ │
│  │   - index.html                         │ │
│  │   - JS bundles                         │ │
│  │   - CSS                                │ │
│  └───────────────────┬────────────────────┘ │
│                      │                      │
│  ┌───────────────────▼────────────────────┐ │
│  │      Serverless Functions (api/)       │ │
│  │                                        │ │
│  │  analyze.js  │  stats.js  │  health.js │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
          │                        │
          ▼                        ▼
┌──────────────────┐     ┌──────────────────┐
│  Google Cloud    │     │    Supabase      │
│  (Gemini API)    │     │  (Auth + DB)     │
└──────────────────┘     └──────────────────┘
```

## 로컬 개발 환경

```
┌─────────────────────────────────────────────┐
│              localhost                        │
│                                             │
│  ┌──────────────────┐  ┌─────────────────┐ │
│  │  Vite Dev Server │  │  Express Server  │ │
│  │   (port 3000)    │  │   (port 5000)   │ │
│  │                  │  │                  │ │
│  │   React HMR      │  │  /api/analyze    │ │
│  │   + Proxy ───────┼─▶│  /api/health     │ │
│  │   (/api → :5000) │  │                  │ │
│  └──────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────┘
```

로컬에서는 Vite의 프록시 설정으로 `/api` 요청을 Express 서버(5000번 포트)로 전달합니다.

## 보안 설계

| 계층 | 보안 조치 |
|------|-----------|
| 클라이언트 | Supabase Anon Key만 노출 (공개 가능한 키) |
| API | Service Role Key는 서버 환경변수로만 접근 |
| 인증 | Supabase Auth JWT 기반 인증 |
| DB | Row Level Security로 본인 데이터만 접근 가능 |
| 입력 | 50,000자 제한, 유효성 검사 |
| 개인정보 | 이력서/채용공고 원문 미저장 (분석 결과만 저장) |

## 기술 선택 이유

| 기술 | 선택 이유 |
|------|-----------|
| React + Vite | 빠른 개발 속도, HMR, 최적화된 빌드 |
| Tailwind CSS | 유틸리티 기반 스타일링, 빠른 UI 구성 |
| Vercel Serverless | 프론트엔드와 동일 플랫폼, 콜드스타트 최소화 |
| Gemini 2.5 Flash | 빠른 응답 속도, JSON 응답 모드 지원, 비용 효율적 |
| Supabase | Auth + DB + RLS 통합 제공, 무료 티어 충분 |
