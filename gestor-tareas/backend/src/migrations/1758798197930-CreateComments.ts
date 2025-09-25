import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class CreateComments1758798197930 implements MigrationInterface {
  public async up(q: QueryRunner): Promise<void> {
    await q.createTable(new Table({
      name: "comments",
      columns: [
        { name: "id", type: "serial", isPrimary: true },
        { name: "taskId", type: "int", isNullable: false },
        { name: "userId", type: "int", isNullable: false },
        { name: "contenido", type: "text", isNullable: false },
        { name: "createdAt", type: "timestamp with time zone", default: "now()", isNullable: false },
      ],
    }));

    await q.createIndex("comments", new TableIndex({ name: "IDX_comments_taskId", columnNames: ["taskId"] }));
    await q.createIndex("comments", new TableIndex({ name: "IDX_comments_userId", columnNames: ["userId"] }));

    await q.createForeignKey("comments", new TableForeignKey({
      columnNames: ["taskId"],
      referencedTableName: "task",
      referencedColumnNames: ["id"],
      onDelete: "CASCADE",
    }));

    await q.createForeignKey("comments", new TableForeignKey({
      columnNames: ["userId"],
      referencedTableName: "user",
      referencedColumnNames: ["id"],
      onDelete: "SET NULL",
    }));
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.dropTable("comments", true);
  }
}
