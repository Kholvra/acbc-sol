-- CreateEnum
CREATE TYPE "Role" AS ENUM ('DONATUR', 'CAMPAIGNER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_address_key" ON "User"("address");
