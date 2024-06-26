// src/app/routes/publicRoutes.ts
import { Router } from 'express';
import BoasVindasController from '../controllers/BoasVindas';
import { login } from '../controllers/AuthController';
import { RefreshController } from '../controllers/RefreshController';

//Asaas
import { fetchCustomerIds } from '../controllers/Asaas/CustomerController';
import { fetchAllCustomerIds } from '../controllers/Asaas/ClientCustomerController';
import { fetchPaymentsByCustomers } from '../controllers/Asaas/PaymentController';
import { listPayments } from '../controllers/Asaas/PaymentController';
import { fetchPaymentsByClientId } from '../controllers/Asaas/PaymentController';
import { migrationAsaas } from '../controllers/Asaas/MigrationController';

//Pagar.me
import { fetchCustomerIdsByName } from '../controllers/Pagarme/PagarmeController';
import { fetchTransactions } from '../controllers/Pagarme/TransactionController';

//Clients
import { 
    fetchClients,
    searchClients, 
    getAllClients, 
    updateClient,
    uploadClients 
} from '../controllers/ClientController';

//Products
import { listProducts, registerProduct, updateProduct, deleteProduct } from '../controllers/ProductController';

//Users
import {
    registerUser,
    updateUser,
    deleteUser,
    forgotPassword,
    resetPassword
} from '../controllers/UserController';

//Integrations
import { 
    listIntegrations, 
    registerIntegration, 
    updateIntegration, 
    deleteIntegration 
} from '../controllers/IntegrationController';

import { sendTestEmail } from '../controllers/EmailController';

//Dashboard
import { getDashboardData } from '../controllers/DashboardController';

//Webhooks (Pagarme)
import { 
    webhookPagarme,
    webhookAsaas
} from '../controllers/WebhookController';

const router = Router();
const boasVindasController = new BoasVindasController();
const refreshController = new RefreshController();

//ROTA INICIAL DE BOAS VINDAS
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

//ROTAS ABAIXO SÃO PRIVADAS

//USUÁRIO DO SISTEMA
//Rotas referente ao usuário do sistema
router.post('/login', login);
router.post('/refresh-token', refreshController.refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

//INDICADORES
//Retorna os dados da tela inicial do usuário administrador
router.get('/dashboard', getDashboardData);

//PAYMENTS
// Definir a rota para listagem de pagamentos
router.post('/list-payments', listPayments);

//CLIENTS
// Rotas para as questões dos clients
router.post('/clients/search', fetchClients);
router.post('/clients/search-alls', searchClients);
router.get('/clients', getAllClients);
router.put('/clients/:id', updateClient);
router.post('/clients/upload', uploadClients);

//PRODUCTS
// Rota voltada para os produtos
router.get('/products', listProducts);
router.post('/products', registerProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

//USERS
// Usuários terciarios do do sistema
router.post('/users', registerUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

//INTEGRATIONS
// Endpoints de integrações (Plataformas terceiras)
router.get('/integrations', listIntegrations);
router.post('/integrations', registerIntegration);
router.put('/integrations/:id', updateIntegration);
router.delete('/integrations/:id', deleteIntegration);

//WEBHOOK
router.post('/webhook-pagarme', webhookPagarme);
router.post('/webhook-asaas', webhookAsaas);

// IMPORTAÇÃO DOS PAGAMENTOS - ASAAS E PAGARME
router.post('/migration-asaas', migrationAsaas);
router.post('/migration-pagarme', fetchTransactions);


//--------- ROTAS UTILIZADAS PARA O DESENVOLVIMENTO

//Teste SendGrid - Concluir o desenvolvimento
router.get('/send-test-email', sendTestEmail);

// Definir a rota para buscar pagamentos por ID do cliente
router.get('/payments-by-client/:id', fetchPaymentsByClientId);

// Definir a rota para buscar IDs dos clientes por nome
router.post('/fetch-customer-ids-by-name', fetchCustomerIdsByName);

// Definir a rota para buscar transações por e-mail dos clients
router.post('/fetch-transactions', fetchTransactions);

// Rotas referente a migração dos dados e informações - Asaas
router.post('/customer-ids-asaas', fetchCustomerIds);
router.post('/all-customer-ids', fetchAllCustomerIds);
router.get('/payments-by-customer', fetchPaymentsByCustomers);


export default router;
