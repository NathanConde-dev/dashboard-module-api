// src/controllers/ClientController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Client } from '../entities/Clients';
import { FindOptionsWhere } from 'typeorm';

interface ClientQueryParams {
  id?: number;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
}

export const fetchClients = async (req: Request, res: Response): Promise<Response> => {
    const queryParams: ClientQueryParams = req.body;
    const clientRepository = AppDataSource.getRepository(Client);

    let where: FindOptionsWhere<Client> = {};
    Object.entries(queryParams).forEach(([key, value]) => {
        if (value) where[key as keyof ClientQueryParams] = value;
    });

    try {
        const clients = await clientRepository.find({ where });
        if (clients.length === 0) {
            return res.status(404).send({ message: "Nenhum cliente encontrado" });
        }
        return res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).send({ message: 'Error fetching clients.' });
    }
};

export const getAllClients = async (req: Request, res: Response): Promise<Response> => {
    const clientRepository = AppDataSource.getRepository(Client);

    try {
        const clients = await clientRepository.find();
        const clientData = clients.map(client => ({
            name: client.name,
            email: client.email,
            cpf: client.cpf,
            phone: client.phone
        }));
        return res.status(200).json(clientData);
    } catch (error) {
        console.error('Error fetching clients:', error);
        return res.status(500).send({ message: 'Error fetching clients.' });
    }
};

export const updateClient = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, email, cpf, phone } = req.body;
    const clientRepository = AppDataSource.getRepository(Client);

    try {
        const client = await clientRepository.findOneBy({ id: parseInt(id, 10) });

        if (!client) {
            return res.status(404).send({ message: 'Cliente não encontrado.' });
        }

        if (name) client.name = name;
        if (email) client.email = email;
        if (cpf) client.cpf = cpf;
        if (phone) client.phone = phone;

        await clientRepository.save(client);
        return res.status(200).send({ message: 'Cliente atualizado com sucesso.' });
    } catch (error) {
        console.error('Error updating client:', error);
        return res.status(500).send({ message: 'Error updating client.' });
    }
};
