import { Request, Response } from 'express';
import { AppDataSource } from '../../../database/data-source';
import { Client } from '../../entities/Clients';
import asaasApi from '../../services/Asaas/AsaasService';
import { In } from 'typeorm';

interface CustomerResponse {
  id_client: number | null;
  customerId: string | null;
  error?: string | null;
}

export async function fetchCustomerIds(req: Request, res: Response): Promise<void> {
  try {
    if (!req.body.emails || !Array.isArray(req.body.emails)) {
      res.status(400).send('Emails list is required and must be an array.');
      return;
    }

    const emails: string[] = req.body.emails;
    const clientRepository = AppDataSource.getRepository(Client);

    // Primeiro, buscar 'id_client' para cada e-mail na base de dados
    const clients = await clientRepository.findBy({ email: In(emails) });

    const clientEmailMap = new Map(clients.map(client => [client.email, client.id]));

    const responses = await Promise.all(
      emails.map(email =>
        asaasApi.get(`/customers?email=${email}`)
        .then(apiResponse => ({ data: apiResponse.data, email }))
        .catch(error => ({ error: error.message, email }))
      )
    );

    const results: CustomerResponse[] = responses.map(response => {
      if ('error' in response) {
        return { id_client: null, customerId: null, error: response.error };
      } else {
        const firstCustomer = response.data.data && response.data.data.length > 0 ? response.data.data[0] : null;
        return {
          id_client: clientEmailMap.get(response.email) || null,
          customerId: firstCustomer ? firstCustomer.id : null,
          error: undefined
        };
      }
    });    

    res.json(results);
  } catch (error) {
    console.error('Error fetching customer IDs from Asaas:', error);
    res.status(500).send('Internal Server Error');
  }
}
