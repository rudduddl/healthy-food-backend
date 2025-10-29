import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import cors from 'cors';

import memberRoutes from './routes/member.js';
import receipeRoutes from './routes/receipe.js';
import diseaseRoutes from './routes/disease.js';

const app = express();

// CORS 설정
app.use(cors({ origin: process.env.FRONT_URL, credentials: true }));

// 요청 데이터 파싱
app.use(bodyParser.json());

// 쿠키 & 세션
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "HF20220525",
    resave: false,
    saveUninitialized: false,
  })
);

// 라우터 등록
app.use("/api/member", memberRoutes);
app.use("/api/receipe", receipeRoutes);
app.use("/api/disease", diseaseRoutes);

export default app;