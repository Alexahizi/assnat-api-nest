-- CreateTable
CREATE TABLE "fiches_demande" (
    "id_fichedemande" TEXT NOT NULL,
    "url" TEXT,
    "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_modification" TIMESTAMP(3),
    "id_demande" TEXT NOT NULL,
    "id_personnel" TEXT NOT NULL,
    "id_service" TEXT,

    CONSTRAINT "fiches_demande_pkey" PRIMARY KEY ("id_fichedemande")
);

-- CreateIndex
CREATE UNIQUE INDEX "fiches_demande_id_demande_key" ON "fiches_demande"("id_demande");

-- AddForeignKey
ALTER TABLE "fiches_demande" ADD CONSTRAINT "fiches_demande_id_demande_fkey" FOREIGN KEY ("id_demande") REFERENCES "demandes"("id_demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_demande" ADD CONSTRAINT "fiches_demande_id_personnel_fkey" FOREIGN KEY ("id_personnel") REFERENCES "personnels"("id_personnel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fiches_demande" ADD CONSTRAINT "fiches_demande_id_service_fkey" FOREIGN KEY ("id_service") REFERENCES "services"("id_service") ON DELETE SET NULL ON UPDATE CASCADE;
