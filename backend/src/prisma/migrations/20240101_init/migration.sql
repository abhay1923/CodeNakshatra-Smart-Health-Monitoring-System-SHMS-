-- CreateEnum("Role", {
--   values: ["PATIENT", "CLINICIAN", "OPERATOR"]
-- });
-- This file is auto-generated placeholder

CREATE TABLE "users" (
    "id" text NOT NULL,
    "email" text NOT NULL,
    "password" text NOT NULL,
    "role" text NOT NULL,
    "name" text,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable(
--     "patients",
--     {
--       "id": String @id @default(cuid()) @map("id") @db.VarChar(191),
--       "userId": String @unique @map("userId") @db.VarChar(191) @relation(User, fields: [userId], references: [id], onDelete: Cascade),
--       "medicalId": String @unique @map("medicalId") @db.VarChar(191),
--       "dateOfBirth": DateTime @db.Timestamp(3),
--       "createdAt": DateTime @default(now()) @db.Timestamp(3),
--       "updatedAt": DateTime @updatedAt @db.Timestamp(3),
--     },
--     {
--       @@map("patients")
--     }
-- );

