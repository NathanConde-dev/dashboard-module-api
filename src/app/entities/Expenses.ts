// src/entities/Client.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    description: string;

    @Column()
    value: string;
}
