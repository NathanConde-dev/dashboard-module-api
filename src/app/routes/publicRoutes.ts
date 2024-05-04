// src/app/routes/publicRoutes.ts
import { Router } from 'express';
import BoasVindasController from '../controllers/BoasVindas';
import { registerUser } from '../controllers/UserController';
import { login } from '../controllers/AuthController';
import { RefreshController } from '../controllers/RefreshController';

const router = Router();
const boasVindasController = new BoasVindasController();
const refreshController = new RefreshController();


router.get('/', boasVindasController.boasVindas);

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registro de usuário
 *     description: Registra um novo usuário no sistema.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso.
 *       400:
 *         description: Erro ao registrar o usuário.
 */
router.post('/register', registerUser);

router.post('/login', login);

router.post('/refresh-token', refreshController.refreshAccessToken);


export default router;
