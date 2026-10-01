import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import v1Routes from './v1/v1.routes.js';
import notFoundMiddleware from './v1/middlewares/notFound.middleware.js';
import { errorMiddleware } from './v1/middlewares/error.middleware.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
