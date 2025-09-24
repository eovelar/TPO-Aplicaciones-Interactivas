import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class CreateHistorial implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "historial",
        columns: [
          { name: "id", type: "serial", isPrimary: true },
          { name: "entidad", type: "varchar", length: "50", isNullable: false },
          { name: "entidadId", type: "int", isNullable: false },
          { name: "accion", type: "varchar", length: "30", isNullable: false },
          { name: "usuarioId", type: "int", isNullable: false },
          {
            name: "fecha",
            type: "timestamp with time zone",
            default: "now()",
            isNullable: false,
          },
          { name: "detalles", type: "jsonb", isNullable: true },
        ],
      }),
      true
    );

    await queryRunner.createIndices("historial", [
      new TableIndex({ name: "IDX_historial_entidad", columnNames: ["entidad"] }),
      new TableIndex({ name: "IDX_historial_entidadId", columnNames: ["entidadId"] }),
      new TableIndex({ name: "IDX_historial_accion", columnNames: ["accion"] }),
      new TableIndex({ name: "IDX_historial_usuarioId", columnNames: ["usuarioId"] }),
      new TableIndex({ name: "IDX_historial_fecha", columnNames: ["fecha"] }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("historial", true);
  }
}
