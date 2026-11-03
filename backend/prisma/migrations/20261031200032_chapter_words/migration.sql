/*
  Warnings:

  - Added the required column `words` to the `Chapter` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "words" INTEGER NOT NULL;
