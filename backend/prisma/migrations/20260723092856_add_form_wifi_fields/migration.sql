-- AlterTable
ALTER TABLE "Form" ADD COLUMN     "wifiEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "wifiPassword" TEXT,
ADD COLUMN     "wifiSsid" TEXT;
