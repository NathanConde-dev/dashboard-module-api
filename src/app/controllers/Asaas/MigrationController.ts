// src/controllers/ClientController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { Client } from '../../entities/Clients';
import asaasApi from '../../services/Asaas/AsaasService';
import { PaymentService } from '../../services/Asaas/PaymentService';

// Função para buscar todos os customers a partir dos e-mails dos Clients
export async function fetchAllCustomerIds(req: Request, res: Response): Promise<Response> {
    try {
        const clientRepository = AppDataSource.getRepository(Client);
        const clients = await clientRepository.find();

        if (clients.length === 0) {
            return res.status(404).send({ message: "Nenhum cliente encontrado." });
        }

        const responses = await Promise.all(
            clients.map(client =>
                asaasApi.get(`/customers?email=${client.email}`)
                .then(apiResponse => ({
                    id_client: client.id,
                    customerId: apiResponse.data.data && apiResponse.data.data.length > 0 ? apiResponse.data.data[0].id : null
                }))
                .catch(error => ({
                    id_client: client.id,
                    customerId: null,
                    error: error.message
                }))
            )
        );

        // Filtrar os resultados para excluir os que têm 'customerId' como null
        const filteredResponses = responses
            .filter(response => response.customerId !== null)
            .map(response => ({
                id_client: response.id_client,
                customerId: response.customerId as string
            }));

        return res.json(filteredResponses);
    } catch (error) {
        console.error('Error fetching all customer IDs:', error);
        return res.status(500).send('Internal Server Error');
    }
}

// Função para salvar a lista de pagamentos de acordo com os clients passados
export const fetchPaymentsByCustomers = async (req: Request, res: Response): Promise<Response> => {
    const clients: { id_client: number; customerId: string }[] = req.body.clients;
    const paymentService = new PaymentService();

    if (!clients || !Array.isArray(clients)) {
        return res.status(400).send({ message: 'Clients list is required and must be an array.' });
    }

    try {
        const paymentsData = await paymentService.processPayments(clients);
        return res.status(200).json(paymentsData);
    } catch (error) {
        console.error('Error fetching payments from Asaas:', error);
        return res.status(500).send({ message: 'Error fetching payments.' });
    }
};

// Novo endpoint para migração de dados do Asaas
export const migrationAsaas = async (req: Request, res: Response): Promise<Response> => {
    try {
        const clientRepository = AppDataSource.getRepository(Client);
        const clients = await clientRepository.find();

        if (clients.length === 0) {
            return res.status(404).send({ message: "Nenhum cliente encontrado." });
        }

        // Passo 1: Buscar todos os customers a partir dos e-mails dos Clients
        const responses = await Promise.all(
            clients.map(client =>
                asaasApi.get(`/customers?email=${client.email}`)
                .then(apiResponse => ({
                    id_client: client.id,
                    customerId: apiResponse.data.data && apiResponse.data.data.length > 0 ? apiResponse.data.data[0].id : null
                }))
                .catch(error => ({
                    id_client: client.id,
                    customerId: null,
                    error: error.message
                }))
            )
        );

        // Filtrar os resultados para excluir os que têm 'customerId' como null
        const filteredResponses = responses
            .filter(response => response.customerId !== null)
            .map(response => ({
                id_client: response.id_client,
                customerId: response.customerId as string
            }));

        // Passo 2: Inserir os pagamentos desses customers no banco de dados
        const paymentService = new PaymentService();
        const paymentsData = await paymentService.processPayments(filteredResponses);

        return res.status(200).json(paymentsData);
    } catch (error) {
        console.error('Error in migration from Asaas:', error);
        return res.status(500).send({ message: 'Error in migration from Asaas.' });
    }
};
