import 'reflect-metadata';
import express, { Express } from 'express';
import { AppDataSource } from './database/data-source';
import { setupSwagger } from './config/swagger';
import routes from './app/routes/routes';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';

dotenv.config();

const app: Express = express();

// Permitir todas as origens
app.use(cors());

// Middleware para parsing do body da requisição
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Definição da porta pelo Railway
const PORT = process.env.PORT || 3010;

AppDataSource.initialize().then(() => {
    console.log("Data Source has been initialized and cache cleared!");
    
    setupSwagger(app);
    app.use('/', routes);
    
    app.listen(PORT, () => console.log('Server started on port', PORT));
}).catch((error: Error) => {
    console.error('Error during Data Source initialization:', error);
});
