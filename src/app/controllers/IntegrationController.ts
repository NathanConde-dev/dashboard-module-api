import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Integration } from '../entities/Integrations';

export const listIntegrations = async (req: Request, res: Response): Promise<Response> => {
    try {
        const integrationRepository = AppDataSource.getRepository(Integration);
        const integrations = await integrationRepository.find();
        return res.status(200).json(integrations);
    } catch (error) {
        console.error('Error listing integrations:', error);
        return res.status(500).send({ message: 'Error listing integrations.' });
    }
};

export const registerIntegration = async (req: Request, res: Response): Promise<Response> => {
    const { name, api_key } = req.body;
    try {
        const integrationRepository = AppDataSource.getRepository(Integration);
        const newIntegration = integrationRepository.create({ name, api_key });
        await integrationRepository.save(newIntegration);
        return res.status(201).send({ message: 'Integration registered successfully.', integration: newIntegration });
    } catch (error) {
        console.error('Error registering integration:', error);
        return res.status(500).send({ message: 'Error registering integration.' });
    }
};

export const updateIntegration = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, api_key } = req.body;
    try {
        const integrationRepository = AppDataSource.getRepository(Integration);
        const integration = await integrationRepository.findOneBy({ id: parseInt(id, 10) });

        if (!integration) {
            return res.status(404).send({ message: 'Integration not found.' });
        }

        integration.name = name;
        integration.api_key = api_key;
        await integrationRepository.save(integration);
        return res.status(200).send({ message: 'Integration updated successfully.', integration });
    } catch (error) {
        console.error('Error updating integration:', error);
        return res.status(500).send({ message: 'Error updating integration.' });
    }
};

export const deleteIntegration = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    try {
        const integrationRepository = AppDataSource.getRepository(Integration);
        const integration = await integrationRepository.findOneBy({ id: parseInt(id, 10) });

        if (!integration) {
            return res.status(404).send({ message: 'Integration not found.' });
        }

        await integrationRepository.remove(integration);
        return res.status(200).send({ message: 'Integration deleted successfully.' });
    } catch (error) {
        console.error('Error deleting integration:', error);
        return res.status(500).send({ message: 'Error deleting integration.' });
    }
};
