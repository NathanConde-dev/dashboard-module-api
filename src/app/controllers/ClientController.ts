// src/controllers/ClientController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Client } from '../entities/Clients';
import { FindOptionsWhere, Like } from 'typeorm';
import multer from 'multer';
import XLSX from 'xlsx';

interface ClientQueryParams {
  id?: number;
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
}

// Configuração do multer para lidar com uploads de arquivos
const upload = multer({ dest: 'uploads/' });

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

export const searchClients = async (req: Request, res: Response): Promise<Response> => {
    const { name, email, cpf, phone } = req.body;
    const clientRepository = AppDataSource.getRepository(Client);

    try {
        const clients = await clientRepository.find({
            where: [
                { name: Like(`%${name}%`) },
                { email: Like(`%${email}%`) },
                { cpf: Like(`%${cpf}%`) },
                { phone: Like(`%${phone}%`) }
            ]
        });

        if (clients.length === 0) {
            return res.status(404).send({ message: "Nenhum cliente encontrado" });
        }
        return res.json(clients);
    } catch (error) {
        console.error('Error searching clients:', error);
        return res.status(500).send({ message: 'Error searching clients.' });
    }
};

export const getAllClients = async (req: Request, res: Response): Promise<Response> => {
    const clientRepository = AppDataSource.getRepository(Client);

    try {
        const clients = await clientRepository.find();
        const clientData = clients.map(client => ({
            id: client.id,
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

        client.name = name !== undefined ? name : client.name;
        //client.email = email !== undefined ? email : client.email;
        client.cpf = cpf !== undefined ? cpf : client.cpf;
        client.phone = phone !== undefined ? phone : client.phone;

        await clientRepository.save(client);
        return res.status(200).send({ message: 'Cliente atualizado com sucesso.' });
    } catch (error) {
        console.error('Error updating client:', error);
        return res.status(500).send({ message: 'Error updating client.' });
    }
};


// Novo endpoint para upload de dados de clientes a partir de uma planilha
export const uploadClients = [
    upload.single('file'), // Middleware do multer para lidar com um único arquivo
    async (req: Request, res: Response): Promise<Response> => {
        const file = (req as any).file;
        if (!file) {
            return res.status(400).send({ message: 'Nenhum arquivo enviado.' });
        }

        try {
            // Ler a planilha
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const clientRepository = AppDataSource.getRepository(Client);

            // Iterar sobre as linhas da planilha e salvar os dados no banco de dados
            for (const row of rows) {
                const { Nome, Email, Identificador, Telefone } = row as any;

                // Verificar se o cliente já existe pelo email
                let client = await clientRepository.findOneBy({ email: Email });

                if (!client) {
                    // Criar novo cliente
                    client = clientRepository.create({
                        name: Nome,
                        email: Email,
                        cpf: Identificador,
                        phone: Telefone || ''
                    });
                } else {
                    // Atualizar dados do cliente existente
                    client.name = Nome;
                    client.cpf = Identificador;
                    client.phone = Telefone || client.phone;
                }

                await clientRepository.save(client);
            }

            return res.status(200).send({ message: 'Dados de clientes importados com sucesso.' });
        } catch (error) {
            console.error('Error uploading client data:', error);
            return res.status(500).send({ message: 'Error uploading client data.' });
        }
    }
];