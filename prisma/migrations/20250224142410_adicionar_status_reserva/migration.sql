/*
  Warnings:

  - The `status` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('PENDENTE', 'PAGO', 'PAGAMENTO_REJEITADO', 'PAGAMENTO_PENDENTE', 'CANCELADO');

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "status",
ADD COLUMN     "status" "ReservationStatus" NOT NULL DEFAULT 'PENDENTE';
