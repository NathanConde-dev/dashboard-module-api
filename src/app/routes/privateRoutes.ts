import { Router } from 'express';

//Users
import {
    getUserInfo,
    updatePassword,
    updateInfo
} from '../controllers/UserController';

const router = Router();

// Usuários administrador do do sistema
router.get('/me', getUserInfo);
router.get('/user-info', getUserInfo);
router.post('/update-password', updatePassword);
router.post('/update-info', updateInfo);


export default router;
