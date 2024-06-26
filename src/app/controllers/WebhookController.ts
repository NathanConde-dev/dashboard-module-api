import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Client } from '../entities/Clients';
import { Payment } from '../entities/Payments';
import axios from 'axios';

// Webhook Pagarme
export const webhookPagarme = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = req.body;
    const { customer, charges, items, order } = data;

    const clientRepository = AppDataSource.getRepository(Client);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Check if the client exists by email
    let client = await clientRepository.findOneBy({ email: customer.email });

    // If client does not exist, create a new client
    if (!client) {
      client = clientRepository.create({
        name: customer.name,
        email: customer.email,
        cpf: customer.document,
        phone: customer.phones && customer.phones.mobile_phone ? customer.phones.mobile_phone.number : null, // Provide null if phone is not available
      });
      await clientRepository.save(client);
    }

    const clientId = client.id;

    // Loop through each charge
    for (const charge of charges) {
      // Find the description from items
      const itemDescription = items && items.length > 0 ? items[0].description : 'No description';

      // Check if the payment exists by id_payment
      let payment = await paymentRepository.findOneBy({ id_payment: charge.id });

      // If payment exists, update the payment status and dates
      if (payment) {
        payment.status = charge.status;
        payment.due_date = order ? order.due_date : null;
        payment.original_due_date = order ? order.due_date : null;
        payment.payment_date = charge.paid_at;
        payment.client_payment_date = charge.paid_at;
      } else {
        // If payment does not exist, create a new payment
        payment = paymentRepository.create({
          id_client: clientId,  // Use the correct field name here
          platform: 'Pagarme',
          id_payment: charge.id,
          value: charge.amount / 100, // Convertendo de centavos para reais
          net_value: charge.amount / 100, // Convertendo de centavos para reais
          description: itemDescription,
          payment_method: charge.payment_method,
          status: charge.status,
          due_date: order ? order.due_date : null, // Adjust as needed
          original_due_date: order ? order.due_date : null, // Adjust as needed
          payment_date: charge.paid_at,
          client_payment_date: charge.paid_at, // Adjust as needed
          installment_number: charge.last_transaction ? charge.last_transaction.installments : 1,
          invoice_url: charge.invoice_url || '', // Adjust as needed
        });
      }
      await paymentRepository.save(payment);
    }

    return res.status(200).send({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    if (error instanceof Error) {
      return res.status(500).send({ message: 'Error processing webhook', error: error.message, stack: error.stack });
    }
    return res.status(500).send({ message: 'Unknown error processing webhook' });
  }
};

// Webhook Asaas
export const webhookAsaas = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { event, payment } = req.body;
    const { id, customer, value, netValue, description, billingType, status, dueDate, originalDueDate, paymentDate, clientPaymentDate, installmentNumber, invoiceUrl } = payment;

    const clientRepository = AppDataSource.getRepository(Client);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Fetch customer details from Asaas API using the customer ID
    const customerDetails = await axios.get(`https://www.asaas.com/api/v3/customers/${customer}`, {
      headers: {
        'access_token': process.env.ASAAS_ACCESS_TOKEN // Ensure the correct header is set
      }
    }).then(response => response.data)
      .catch((error: any) => {
        console.error('Error fetching customer details from Asaas:', error);
        throw new Error('Error fetching customer details from Asaas');
      });

    // Check if the client exists by email
    let client = await clientRepository.findOneBy({ email: customerDetails.email });

    // If client does not exist, create a new client
    if (!client) {
      client = clientRepository.create({
        name: customerDetails.name,
        email: customerDetails.email,
        cpf: customerDetails.cpfCnpj,
        phone: customerDetails.phone || ''
      });
      await clientRepository.save(client);
    }

    const clientId = client.id;

    // Check if the payment exists by id_payment
    let paymentRecord = await paymentRepository.findOneBy({ id_payment: id });

    // If payment exists, update the payment status and dates
    if (paymentRecord) {
      paymentRecord.status = status;
      paymentRecord.due_date = dueDate;
      paymentRecord.original_due_date = originalDueDate;
      paymentRecord.payment_date = paymentDate;
      paymentRecord.client_payment_date = clientPaymentDate;
    } else {
      // If payment does not exist, create a new payment
      paymentRecord = paymentRepository.create({
        id_payment: id,
        id_client: clientId,  // Use the correct field name here
        platform: 'Asaas',
        value,
        net_value: netValue,
        description,
        payment_method: billingType,
        status,
        due_date: dueDate,
        original_due_date: originalDueDate,
        payment_date: paymentDate,
        client_payment_date: clientPaymentDate,
        installment_number: installmentNumber || 1,
        invoice_url: invoiceUrl || ''
      });
    }
    await paymentRepository.save(paymentRecord);

    return res.status(200).send({ message: 'Webhook processed successfully' });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).send({ message: 'Error processing webhook' });
  }
};
