// src/entities/Client.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('integrations')
export class Integra {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    api_key: string;
}
