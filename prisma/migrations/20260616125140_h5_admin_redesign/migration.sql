/*
  Warnings:

  - Added the required column `updatedAt` to the `Community` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TimelineEvent" ADD COLUMN "operatorId" TEXT;
ALTER TABLE "TimelineEvent" ADD COLUMN "operatorName" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Community" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "qrCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Community" ("id", "name", "qrCode", "region") SELECT "id", "name", "qrCode", "region" FROM "Community";
DROP TABLE "Community";
ALTER TABLE "new_Community" RENAME TO "Community";
CREATE TABLE "new_RepairAttachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "type" TEXT NOT NULL DEFAULT 'reporter',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairAttachment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "RepairOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_RepairAttachment" ("createdAt", "id", "orderId", "thumbnailUrl", "url") SELECT "createdAt", "id", "orderId", "thumbnailUrl", "url" FROM "RepairAttachment";
DROP TABLE "RepairAttachment";
ALTER TABLE "new_RepairAttachment" RENAME TO "RepairAttachment";
CREATE TABLE "new_RepairOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "communityId" TEXT NOT NULL,
    "reporterPhone" TEXT NOT NULL,
    "contactName" TEXT,
    "building" TEXT,
    "unit" TEXT,
    "location" TEXT,
    "preferredTime" DATETIME,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "description" TEXT,
    "lat" REAL,
    "lng" REAL,
    "assignedTo" TEXT,
    "handlerId" TEXT,
    "deadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepairOrder_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RepairOrder_handlerId_fkey" FOREIGN KEY ("handlerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_RepairOrder" ("assignedTo", "category", "communityId", "createdAt", "deadline", "description", "id", "lat", "lng", "reporterPhone", "severity", "status", "updatedAt") SELECT "assignedTo", "category", "communityId", "createdAt", "deadline", "description", "id", "lat", "lng", "reporterPhone", "severity", "status", "updatedAt" FROM "RepairOrder";
DROP TABLE "RepairOrder";
ALTER TABLE "new_RepairOrder" RENAME TO "RepairOrder";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
