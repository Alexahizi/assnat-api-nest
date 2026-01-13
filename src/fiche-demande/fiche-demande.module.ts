import { Module } from '@nestjs/common';
import { FicheDemandeService } from './fiche-demande.service';
import { FicheDemandeController } from './fiche-demande.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { UploaderModule } from '../shared/uploader/uploader.module';

@Module({
  imports: [PrismaModule, UploaderModule],
  controllers: [FicheDemandeController],
  providers: [FicheDemandeService],
  exports: [FicheDemandeService],
})
export class FicheDemandeModule {}

