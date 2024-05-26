import 'reflect-metadata';
import express, { Express } from 'express';
import { AppDataSource } from './database/data-source';
import { setupSwagger } from './config/swagger';
import routes from './app/routes/routes';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

const app: Express = express();

// Permitir todas as origens
app.use(cors());
app.use(express.json());

AppDataSource.initialize().then(() => {
  
    console.log("Data Source has been initialized and cache cleared!");
    
    setupSwagger(app);
    app.use('/', routes);
    
    app.listen(3010, () => console.log('Server started on port 3010'));
}).catch((error: Error) => {

    console.error('Error during Data Source initialization:', error);
});
