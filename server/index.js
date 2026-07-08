import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeResumeFit } from './gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main analysis endpoint
app.post('/api/analyze', async (req, res) => {
  try {
    const { resume, jobPosting } = req.body;

    if (!resume || !jobPosting) {
      return res.status(400).json({
        error: '이력서와 채용 공고를 모두 입력해 주세요.',
      });
    }

    if (resume.length > 50000 || jobPosting.length > 50000) {
      return res.status(400).json({
        error: '입력 텍스트가 너무 깁니다. 50,000자 이내로 입력해 주세요.',
      });
    }

    const result = await analyzeResumeFit(resume, jobPosting);
    res.json(result);
  } catch (error) {
    console.error('Analysis error:', error.message);

    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'AI 서비스 인증에 실패했습니다. 관리자에게 문의하세요.',
      });
    }

    if (error.message.includes('quota') || error.message.includes('rate')) {
      return res.status(429).json({
        error: 'AI 서비스 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
      });
    }

    res.status(500).json({
      error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
