import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: true })
    id_client: number;

    @Column()
    id_payment: string;

    @Column()
    platform: string;

    @Column({ type: 'float', nullable: true })
    value: number;

    @Column({ type: 'float', nullable: true })
    net_value: number;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    payment_method: string;

    @Column({ nullable: true })
    status: string;

    @Column({ type: 'date', nullable: true })
    due_date: Date;

    @Column({ type: 'date', nullable: true })
    original_due_date: Date;

    @Column({ type: 'date', nullable: true })
    payment_date: Date;

    @Column({ type: 'date', nullable: true })
    client_payment_date: Date;

    @Column({ type: 'int', nullable: true })
    installment_number: number;

    @Column({ nullable: true })
    invoice_url: string;
}
