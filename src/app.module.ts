import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { RhModule } from './rh/rh.module';
import { ChefdeserviceModule } from './chefdeservice/chefdeservice.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './shared/notification/notification.module';
import { UploaderModule } from './shared/uploader/uploader.module';
import { ComptabiliteModule } from './comptabilite/comptabilite.module';
import { FicheDemandeModule } from './fiche-demande/fiche-demande.module';

@Module({
  imports: [UserModule, RhModule, ChefdeserviceModule, AuthModule, NotificationModule, UploaderModule, ComptabiliteModule, FicheDemandeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
