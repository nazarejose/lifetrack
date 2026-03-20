-- AlterTable
ALTER TABLE "goals" ADD COLUMN     "habitId" TEXT;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "habits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
