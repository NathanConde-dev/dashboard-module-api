// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

// Definindo as opções de configuração para o Swagger
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API da Dashboard',
      version: '1.0.0',
      description: 'Documentação da API relacionada ao sistema de dashboard',
    },
  },
  // Caminho para os arquivos que contêm anotações swagger (rotas)
  apis: ['./src/app/routes/*.ts'],
};

// Gerando a especificação do Swagger a partir das opções
const swaggerSpec = swaggerJsdoc(options);

// Função para configurar o Swagger UI no aplicativo Express
function setupSwagger(app: Express): void {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Exportando a função de configuração
export { setupSwagger };
