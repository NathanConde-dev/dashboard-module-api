import { Request, Response } from 'express';
import PagarmeApi from '../../services/Pagarme/PagarmeService';

interface CustomerResponse {
  name: string;
  customerId: string | null;
  error?: string | null;
}

export const fetchCustomerIdsByName = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.body.names || !Array.isArray(req.body.names)) {
      res.status(400).send('Names list is required and must be an array.');
      return;
    }

    const names: string[] = req.body.names;

    // Adicionar um log para verificar os nomes recebidos
    console.log('Received names:', names);

    const responses = await Promise.all(
      names.map(name =>
        PagarmeApi.get('/customers', { params: { name } })
          .then(apiResponse => ({ data: apiResponse.data, name }))
          .catch(error => {
            console.error('Error fetching customer:', error.response ? error.response.data : error.message);
            return { error: error.response ? error.response.data : error.message, name };
          })
      )
    );

    const results: CustomerResponse[] = responses.map(response => {
      if ('error' in response) {
        return { name: response.name, customerId: null, error: response.error };
      } else {
        // Adicionar um log para verificar a resposta da API
        console.log('API Response for name:', response.name, 'Data:', response.data);

        return {
          name: response.name,
          customerId: response.data.length > 0 ? response.data[0].id : null,
          error: undefined
        };
      }
    });

    res.json(results);
  } catch (error) {
    console.error('Error fetching customer IDs from Pagar.me:', error);
    res.status(500).send('Internal Server Error');
  }
};
