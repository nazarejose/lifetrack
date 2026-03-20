/*
  Warnings:

  - You are about to alter the column `targetValue` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `currentValue` on the `goals` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "goals" ALTER COLUMN "targetValue" SET DATA TYPE INTEGER,
ALTER COLUMN "currentValue" SET DEFAULT 0,
ALTER COLUMN "currentValue" SET DATA TYPE INTEGER;
