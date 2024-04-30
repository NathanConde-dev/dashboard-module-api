import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../app/entities/Users";
import { CreateUsersAndRefreshTokens1714277035290 } from "./migrations/1714277035290-CreateUsersTable";

// Carrega variáveis de ambiente
import 'dotenv/config';
import { RefreshToken } from "../app/entities/RefreshToken";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306, // Se DB_PORT não for definido, usa 3306 como padrão
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  synchronize: process.env.TYPEORM_SYNCHRONIZE === 'false', // Usar strings 'true'/'false' e converter
  dropSchema: false,
  logging: true,
  entities: [User, RefreshToken],
  migrations: [
    CreateUsersAndRefreshTokens1714277035290
  ],
  subscribers: [],
});
