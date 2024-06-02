import { Request, Response } from 'express';
import PagarmeApi from '../../services/Pagarme/PagarmeService';
import { AppDataSource } from '../../../database/data-source';
import { Payment } from '../../entities/Payments';
import { Client } from '../../entities/Clients';
import { PagarmeTransaction } from '../../interfaces/Pagarme/PagarmeInterfaces';

interface TransactionResponse {
  email: string;
  transactions: PagarmeTransaction[];
  error?: string | null;
}

const fetchAllTransactions = async (): Promise<PagarmeTransaction[]> => {
  let allTransactions: PagarmeTransaction[] = [];
  let cursor: string | null = null;

  do {
    const response: { data: PagarmeTransaction[], headers: { [key: string]: string } } = await PagarmeApi.get('/transactions', {
      params: {
        count: 1000,
        ...(cursor ? { cursor } : {})
      }
    });

    allTransactions = allTransactions.concat(response.data);
    cursor = response.headers['x-cursor-nextpage'] || null;
  } while (cursor);

  return allTransactions;
};

export const fetchTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    // Fetch all clients
    const clientRepository = AppDataSource.getRepository(Client);
    const clients = await clientRepository.find();

    if (clients.length === 0) {
      res.status(404).send('No clients found.');
      return;
    }

    const emails = clients.map(client => client.email);
    const clientEmailMap = new Map(clients.map(client => [client.email, client.id]));

    // Fetch all transactions
    const allTransactions = await fetchAllTransactions();

    // Filter transactions based on the provided emails and status
    const transactionsResponses: TransactionResponse[] = emails.map(email => {
      const transactions = allTransactions.filter((transaction: PagarmeTransaction) =>
        transaction.customer.email === email && (!status || transaction.status === status)
      );
      if (transactions.length > 0) {
        return { email, transactions, error: null };
      } else {
        return { email, transactions: [], error: 'No transactions found' };
      }
    });

    // Save the transactions for the provided emails
    const paymentRepository = AppDataSource.getRepository(Payment);

    for (const response of transactionsResponses) {
      if (response.transactions.length > 0) {
        const client_id = clientEmailMap.get(response.email);

        for (const transaction of response.transactions) {
          const existingPayment = await paymentRepository.findOneBy({ id_payment: transaction.id.toString() });
          if (!existingPayment && client_id) {
            const newPayment = paymentRepository.create({
              // @ts-ignore
              id_client: client_id,
              id_payment: transaction.id.toString(),
              platform: 'Pagarme',
              value: transaction.amount / 100, // Convertendo de centavos para reais
              net_value: transaction.paid_amount / 100, // Convertendo de centavos para reais
              description: transaction.items.map(item => item.title).join(', '),
              payment_method: transaction.payment_method,
              status: transaction.status,
              due_date: new Date(transaction.date_created),
              original_due_date: new Date(transaction.date_created),
              payment_date: transaction.status === 'paid' ? new Date(transaction.date_updated) : null,
              client_payment_date: transaction.status === 'paid' ? new Date(transaction.date_updated) : null,
              installment_number: transaction.installments,
              invoice_url: transaction.receipt_url || '',
            });
            await paymentRepository.save(newPayment);
          }
        }
      }
    }

    res.json(transactionsResponses);
  } catch (error: unknown) {
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error fetching transactions from Pagar.me:', errorMessage);
    res.status(500).send(errorMessage);
  }
};
