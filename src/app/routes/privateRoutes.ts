import { Router } from 'express';
import { dashboard } from '../controllers/Dashboard';
import { updatePassword } from '../controllers/UserController';
import { searchPagarmeSales } from '../controllers/PagarmeController';

const router = Router();

// Rota protegida /dashboard
router.post('/dashboard', dashboard);

router.put('/update-password', updatePassword);

// Defina a rota para buscar vendas no Pagarme
router.get('/search-pagarme', searchPagarmeSales);

export default router;
