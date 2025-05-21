/*
  Warnings:

  - Added the required column `agendaId` to the `Reservation` table without a default value. This is not possible if the table is not empty.

*/
-- Remover todas as reservas existentes
DELETE FROM "Reservation";

-- Primeiro, adicione a coluna como nullable
ALTER TABLE "Reservation" ADD COLUMN "agendaId" TEXT;

-- Crie uma agenda para cada reserva existente
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT * FROM "Reservation"
    LOOP
        -- Criar uma agenda para esta reserva
        WITH new_agenda AS (
            INSERT INTO "Agenda" (
                id,
                titulo,
                "tipoReserva",
                "dataInicio",
                "dataFim",
                "espacoId",
                "createdAt",
                "updatedAt",
                descricao,
                "valorHora"
            )
            VALUES (
                'agenda_' || r.id,
                'Agenda da Reserva ' || r.id,
                'HORA',
                r."dataInicio",
                r."dataFim",
                r."espacoId",
                r."createdAt",
                r."updatedAt",
                '',
                r.valor
            )
            RETURNING id
        )
        -- Atualizar a reserva com o ID da nova agenda
        UPDATE "Reservation"
        SET "agendaId" = new_agenda.id
        FROM new_agenda
        WHERE "Reservation".id = r.id;
    END LOOP;
END $$;

-- Agora torne a coluna NOT NULL
ALTER TABLE "Reservation" ALTER COLUMN "agendaId" SET NOT NULL;

-- Crie o índice
CREATE INDEX "Reservation_agendaId_idx" ON "Reservation"("agendaId");

-- Adicione a foreign key
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
