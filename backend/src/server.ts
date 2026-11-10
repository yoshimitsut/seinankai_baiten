import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtoRoutes from './routes/produtoRoutes';
import vendaRoutes from './routes/vendaRoutes';
import { testConnection } from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);

// Healthcheck
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    sistema: 'Seinenkai Baiten API',
    timestamp: new Date().toISOString(),
  });
});

// Middleware Global de Tratamento de Erros
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado na aplicação:', err);
  res.status(500).json({
    mensagem: 'Ocorreu um erro interno no servidor.',
    detalhes: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Inicia o servidor e verifica conexão com banco
app.listen(PORT, async () => {
  console.log(`🚀 Servidor Seinenkai Baiten rodando na porta ${PORT}`);
  await testConnection();
});

