import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../app/entities/Users";
import { CreateUsersAndRefreshTokens1714277035290 } from "./migrations/1714277035290-CreateUsersTable";

// Carrega variáveis de ambiente
import 'dotenv/config';
import { RefreshToken } from "../app/entities/RefreshToken";
import { CreateClientsTable1714526519895 } from "./migrations/1714526519895-CreateClientsTable";
import { Client } from "../app/entities/Clients";
import { CreateIntegrationsTable1714527583264 } from "./migrations/1714527583264-CreateIntegrationsTable";
import { Integra } from "../app/entities/Integration";
import { CreateProductsTable1714529113119 } from "./migrations/1714529113119-CreateProductsTable";
import { Product } from "../app/entities/Products";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
  dropSchema: false,
  logging: true,
  entities: [
    User, 
    RefreshToken, 
    Client, 
    Integra,
    Product
  ],
  migrations: [
    CreateUsersAndRefreshTokens1714277035290, //Tabela Usuários do Sistema
    CreateClientsTable1714526519895, //Tabela Mentorados
    CreateIntegrationsTable1714527583264, //Tabela de Integrações (Pagarme, Asaas)
    CreateProductsTable1714529113119, //Tabela de Produtos (Mentoria de 6 meses, Mentoria de 1 ano)
  ],
  subscribers: [],
});
