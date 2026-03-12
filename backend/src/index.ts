import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import router from './routes';

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(router);

app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Backend is running' });
});

app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
