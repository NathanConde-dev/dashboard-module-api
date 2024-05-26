// src/controllers/ProductController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../database/data-source';
import { Product } from '../entities/Products';

export const listProducts = async (req: Request, res: Response): Promise<Response> => {
    const productRepository = AppDataSource.getRepository(Product);

    try {
        const products = await productRepository.find();
        const productData = products.map(product => ({
            id: product.id,
            name: product.name,
            duration: product.duration
        }));
        return res.status(200).json(productData);
    } catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).send({ message: 'Error fetching products.' });
    }
};

export const registerProduct = async (req: Request, res: Response): Promise<Response> => {
    const { name, duration } = req.body;
    const productRepository = AppDataSource.getRepository(Product);

    if (!name || duration === undefined) {
        return res.status(400).send({ message: 'Name and duration are required.' });
    }

    try {
        const newProduct = productRepository.create({ name, duration });
        await productRepository.save(newProduct);
        return res.status(201).send({ message: 'Product registered successfully.', productId: newProduct.id });
    } catch (error) {
        console.error('Error registering product:', error);
        return res.status(500).send({ message: 'Error registering product.' });
    }
};

export const updateProduct = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const { name, duration } = req.body;
    const productRepository = AppDataSource.getRepository(Product);

    try {
        const product = await productRepository.findOneBy({ id: parseInt(id, 10) });

        if (!product) {
            return res.status(404).send({ message: 'Product not found.' });
        }

        if (name) product.name = name;
        if (duration !== undefined) product.duration = duration;

        await productRepository.save(product);
        return res.status(200).send({ message: 'Product updated successfully.' });
    } catch (error) {
        console.error('Error updating product:', error);
        return res.status(500).send({ message: 'Error updating product.' });
    }
};

export const deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;
    const productRepository = AppDataSource.getRepository(Product);

    try {
        const product = await productRepository.findOneBy({ id: parseInt(id, 10) });

        if (!product) {
            return res.status(404).send({ message: 'Product not found.' });
        }

        await productRepository.remove(product);
        return res.status(200).send({ message: 'Product deleted successfully.' });
    } catch (error) {
        console.error('Error deleting product:', error);
        return res.status(500).send({ message: 'Error deleting product.' });
    }
};
