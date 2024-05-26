import { Request, Response } from 'express';
import { PaymentService } from '../../services/Asaas/PaymentService';
import { ClientPayment } from '../../interfaces/Asaas/PaymentInterfaces';
import { AppDataSource } from '../../../database/data-source';
import { Payment } from '../../entities/Payments';
import { Between, FindOptionsWhere } from 'typeorm';

//Responsável por salvar a lista de pagamentos de acordo com os clients passados
export const fetchPaymentsByCustomers = async (req: Request, res: Response): Promise<Response> => {
  const clients: ClientPayment[] = req.body.clients;
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

//Retornar a listagem personalizada da dashboard interna
interface PaymentQueryParams {
    status?: string;
    payment_method?: string;
    initial_date?: string;
    final_date?: string;
}

export const listPayments = async (req: Request, res: Response): Promise<Response> => {
    const { status, payment_method, initial_date, final_date }: PaymentQueryParams = req.body;

    const paymentRepository = AppDataSource.getRepository(Payment);

    // Construir o objeto de condições para a consulta
    let where: FindOptionsWhere<Payment> = {};

    if (status) {
        where.status = status;
    }
    
    if (payment_method) {
        where.payment_method = payment_method;
    }

    if (initial_date && final_date) {
        where.due_date = Between(new Date(initial_date), new Date(final_date));
    }

    try {
        const payments = await paymentRepository.find({ where });
        return res.json(payments);
    } catch (error) {
        console.error('Error listing payments:', error);
        return res.status(500).send({ message: 'Error fetching payments.' });
    }
};

//Responsável por retornar os pagamentos de um cliente específico
export const fetchPaymentsByClientId = async (req: Request, res: Response): Promise<Response> => {
    const clientId = parseInt(req.params.id);

    if (!clientId) {
        return res.status(400).send({ message: 'Client ID is required.' });
    }

    const paymentRepository = AppDataSource.getRepository(Payment);
    try {
        const payments = await paymentRepository.find({
            where: {
                id_client: clientId
            }
        });

        if (payments.length === 0) {
            return res.status(404).send({ message: "No payments found for this client." });
        }

        return res.json(payments);
    } catch (error) {
        console.error('Error fetching payments by client ID:', error);
        return res.status(500).send({ message: 'Error fetching payments.' });
    }
};