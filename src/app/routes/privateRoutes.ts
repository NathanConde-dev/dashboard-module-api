import { Router } from 'express';
import { dashboard } from '../controllers/Dashboard';
import { updatePassword } from '../controllers/UserController';
import { searchPagarmeSales } from '../controllers/PagarmeController';
import { getUserInfo } from '../controllers/UserController';

const router = Router();

// Rota protegida /dashboard
router.post('/dashboard', dashboard);

// Rota para atualizar a senha de usuário
router.put('/update-password', updatePassword);

// Defina a rota para buscar vendas no Pagarme
router.get('/search-pagarme', searchPagarmeSales);

router.get('/me', getUserInfo);


export default router;
