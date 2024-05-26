import asaasApi from './AsaasService';
import { AppDataSource } from '../../../database/data-source';
import { Payment } from '../../entities/Payments';
import { ClientPayment } from '../../interfaces/Asaas/PaymentInterfaces';

export class PaymentService {
    async processPayments(clients: ClientPayment[]): Promise<any[]> {
        const paymentRepository = AppDataSource.getRepository(Payment);

        if (!Array.isArray(clients) || clients.length === 0) {
            throw new Error("No clients provided or the format is incorrect.");
        }

        const results = await Promise.all(
            clients.map(async (client) => {
                try {
                    const response = await asaasApi.get(`/payments?customer=${client.customerId}`);
                    const payments = response.data.data;
                    const paymentsSaved = [];
        
                    for (const payment of payments) {
                        const existingPayment = await paymentRepository.findOneBy({ id_payment: payment.id });
                        if (!existingPayment) {
                            const newPayment = paymentRepository.create({
                                // @ts-ignore
                                id_client: client.id_client,
                                id_payment: payment.id,
                                platform: 'Asaas',
                                value: payment.value,
                                net_value: payment.netValue,
                                description: payment.description,
                                payment_method: payment.billingType,
                                status: payment.status,
                                due_date: new Date(payment.dueDate),
                                original_due_date: new Date(payment.originalDueDate),
                                payment_date: payment.paymentDate ? new Date(payment.paymentDate) : null,
                                client_payment_date: payment.clientPaymentDate ? new Date(payment.clientPaymentDate) : null,
                                installment_number: payment.installmentNumber,
                                invoice_url: payment.invoiceUrl
                            });
                            await paymentRepository.save(newPayment);
                            paymentsSaved.push(newPayment);
                        }
                    }
                    return { id_client: client.id_client, customerId: client.customerId, payments: paymentsSaved };
                } catch (e) {
                    console.error(`Error fetching payments for customer ${client.customerId}:`, e);
                    return { customerId: client.customerId, error: e instanceof Error ? e.message : 'Unknown error' };
                }
            })
        );
        

        return results;
    }
}
