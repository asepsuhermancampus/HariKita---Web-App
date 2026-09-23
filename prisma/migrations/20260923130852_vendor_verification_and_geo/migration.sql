-- AlterTable
ALTER TABLE "ClientProfile" ADD COLUMN     "desa" TEXT,
ADD COLUMN     "dusun" TEXT,
ADD COLUMN     "kabupaten" TEXT DEFAULT 'Kebumen',
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "rt" TEXT,
ADD COLUMN     "rw" TEXT;

-- AlterTable
ALTER TABLE "VendorProfile" ADD COLUMN     "businessPhotoUrl" TEXT,
ADD COLUMN     "desa" TEXT,
ADD COLUMN     "dusun" TEXT,
ADD COLUMN     "ewalletProvider" TEXT,
ADD COLUMN     "kabupaten" TEXT DEFAULT 'Kebumen',
ADD COLUMN     "kecamatan" TEXT,
ADD COLUMN     "ktpNumber" TEXT,
ADD COLUMN     "ktpPhotoUrl" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "revenueMethod" TEXT,
ADD COLUMN     "rt" TEXT,
ADD COLUMN     "rw" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3),
ALTER COLUMN "isVerified" SET DEFAULT false,
ALTER COLUMN "verificationStatus" SET DEFAULT 'PENDING';


