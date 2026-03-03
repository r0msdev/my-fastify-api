-- CreateTable
CREATE TABLE "WeatherRecord" (
    "id" TEXT NOT NULL,
    "sensorName" TEXT NOT NULL,
    "sensorDate" TIMESTAMP(3) NOT NULL,
    "dataInfo" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeatherRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WeatherRecord_sensorName_idx" ON "WeatherRecord"("sensorName");

-- CreateIndex
CREATE INDEX "WeatherRecord_sensorDate_idx" ON "WeatherRecord"("sensorDate");
