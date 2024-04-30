import { Router } from 'express';
import { dashboard } from '../controllers/Dashboard';
import { updatePassword } from '../controllers/UserController';

const router = Router();

// Rota protegida /dashboard
router.post('/dashboard', dashboard);

router.put('/update-password', updatePassword);

export default router;
