import { Router } from 'express';
import publicRoutes from './publicRoutes';
import privateRoutes from './privateRoutes';
import { authMiddleware } from '../middleware/authMiddleware';  // Certifique-se de que o caminho está correto

const router = Router();

// Aplica o middleware de autenticação na raiz, decidindo automaticamente a natureza da rota
router.use(authMiddleware);

// Monta todas as rotas após o middleware
router.use('/', publicRoutes);
router.use('/', privateRoutes); // Ainda sob '/', pois o middleware controla o acesso

export default router;
