import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateExpensesTable1715281639678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: "expenses",
            columns: [
                {
                    name: "id",  // Chave do registro no banco
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: "description",  // Descrição da despesa
                    type: "text",
                    isNullable: true
                },
                {
                    name: "value",  // Valor da despesa
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
        await queryRunner.dropTable("expenses");
    }

}
