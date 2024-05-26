import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Client } from '../entities/Clients';
import { Payment } from '../entities/Payments';

export const getDashboardData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const clientRepository = AppDataSource.getRepository(Client);
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Contagem de clientes
    const clientsCount = await clientRepository.count();

    // Contagem total de pagamentos com status "paid"
    const paymentsCount = await paymentRepository.count({ where: { status: 'paid' } });

    // Buscar todos os valores de net_value dos pagamentos com status "paid"
    const paidPayments = await paymentRepository.find({ where: { status: 'paid' } });

    // Converter cada net_value de centavos para reais e somar
    const totalNetValueInReais = paidPayments.reduce((sum, payment) => sum + parseFloat(payment.net_value as unknown as string) / 100, 0);

    // Formatar o totalNetValue como moeda em Real (R$)
    const formattedTotalNetValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(totalNetValueInReais);

    // Agrupar e somar os valores dos pagamentos por data
    const salesData: { [date: string]: number } = paidPayments.reduce((acc: { [date: string]: number }, payment) => {
      const paymentDate = new Date(payment.payment_date).toISOString().split('T')[0];
      const netValueInReais = parseFloat(payment.net_value as unknown as string) / 100;
      if (!acc[paymentDate]) {
        acc[paymentDate] = 0;
      }
      acc[paymentDate] += netValueInReais;
      return acc;
    }, {});

    // Formatar os dados de vendas
    const formattedSalesData = Object.keys(salesData).map(date => ({
      date,
      value: salesData[date],
    }));

    // Calcular a data de hoje
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    // Calcular o valor total das vendas de hoje
    const todaysPayments = paidPayments.filter(payment => new Date(payment.payment_date).toISOString().split('T')[0] === todayString);
    const todaysTotalNetValueInReais = todaysPayments.reduce((sum, payment) => sum + parseFloat(payment.net_value as unknown as string) / 100, 0);
    const formattedTodaysTotalNetValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(todaysTotalNetValueInReais);

    return res.status(200).json({
      clientsCount,
      paymentsCount,
      totalNetValue: formattedTotalNetValue,
      todaysTotalNetValue: formattedTodaysTotalNetValue,
      salesData: formattedSalesData,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).send({ message: 'Error fetching dashboard data.' });
  }
};
