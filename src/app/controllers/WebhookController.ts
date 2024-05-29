import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Client } from '../entities/Clients';
import { Payment } from '../entities/Payments';
import axios from 'axios';


export const webhookPagarme = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { data } = req.body;
    const { customer, charges, items } = data;

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
        phone: customer.phones ? customer.phones.mobile : '',
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

      // If payment exists, update the payment status
      if (payment) {
        payment.status = charge.status;
      } else {
        // If payment does not exist, create a new payment
        payment = paymentRepository.create({
          id_client: clientId,  // Use the correct field name here
          platform: 'Pagarme',
          id_payment: charge.id,
          value: charge.amount,
          net_value: charge.amount, // Adjust if you have net value separately
          description: itemDescription,
          payment_method: charge.payment_method,
          status: charge.status,
          due_date: data.due_date,
          original_due_date: data.due_date, // Adjust as needed
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
    return res.status(500).send({ message: 'Error processing webhook' });
  }
};


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
  
      // If payment exists, update the payment status
      if (paymentRecord) {
        paymentRecord.status = status;
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