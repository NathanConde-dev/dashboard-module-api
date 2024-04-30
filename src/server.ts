import 'reflect-metadata';
import express, { Express } from 'express';
import { AppDataSource } from './database/data-source';
import { setupSwagger } from './config/swagger';
import routes from './app/routes/routes';

const app: Express = express();

app.use(express.json());
AppDataSource.initialize().then(() => {
    setupSwagger(app);
    app.use('/', routes); 
    app.listen(3000, () => console.log('Server started on port 3000'));
}).catch((error: Error) => {
    console.error('Error during Data Source initialization:', error);
});
