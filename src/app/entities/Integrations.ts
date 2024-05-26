import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('integrations')
export class Integration {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    api_key: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
