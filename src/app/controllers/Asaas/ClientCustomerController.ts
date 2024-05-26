import { Request, Response } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { Client } from '../../entities/Clients';
import asaasApi from '../../services/Asaas/AsaasService';

export async function fetchAllCustomerIds(req: Request, res: Response): Promise<void> {
    try {
        const clientRepository = AppDataSource.getRepository(Client);
        const clients = await clientRepository.find();

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
        const filteredResponses = responses.filter(response => response.customerId !== null);

        res.json(filteredResponses);
    } catch (error) {
        console.error('Error fetching all customer IDs:', error);
        res.status(500).send('Internal Server Error');
    }
}
