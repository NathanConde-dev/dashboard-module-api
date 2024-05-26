import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreatePaymentsTable1715281639677 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: "payments",
            columns: [
                {
                    name: "id",  // Chave do registro no banco
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "id_client",  // Id referente ao cliente
                    type: "int",
                    isNullable: true 
                },
                {
                    name: "platform",  // De onde está vindo o pagamento
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "id_payment",  // Essa chave será a dos pagamentos dependendo da plataforma
                    type: "varchar",
                    length: "255",
                },
                {
                    name: "payment_method", // Crédito, pix, boleto
                    type: "varchar",
                    length: "50",
                    isNullable: true
                },
                {
                    name: "description", // Opcional se tiver descrição
                    type: "text",
                    isNullable: true
                },
                {
                    name: "status", // Status do pagamento
                    type: "varchar",
                    length: "50",
                    isNullable: true
                },
                {
                    name: "value", // Valor total
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "net_value", // Valor líquido
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: "due_date",  // Data de vencimento
                    type: "date",
                    isNullable: true
                },
                {
                    name: "original_due_date", // Data de vencimento original
                    type: "date",
                    isNullable: true
                },
                {
                    name: "payment_date", // Data de pagamento
                    type: "date",
                    isNullable: true
                },
                {
                    name: "client_payment_date", // Data que o cliente pagou
                    type: "date",
                    isNullable: true
                },
                {
                    name: "installment_number",  // Número da parcela paga ou não
                    type: "int",
                    isNullable: true
                },
                {
                    name: "invoice_url", // Url da fatura
                    type: "varchar",
                    length: "255",
                    isNullable: true
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                    onUpdate: 'CURRENT_TIMESTAMP'
                }
            ]
        });

        await queryRunner.createTable(table, true);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("payments");
    }

}
