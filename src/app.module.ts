import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EmbassyController } from './embassy/embassy.controller';
import { EmbassyService } from './embassy/embassy.service';
import { AppService } from "./app.service";
import { RucaptchaController } from './rucaptcha/rucaptcha.controller';
import { RucaptchaService } from './rucaptcha/rucaptcha.service';

@Module({
  imports: [],
  controllers: [AppController, EmbassyController, RucaptchaController],
  providers: [AppService, EmbassyService, RucaptchaService],
})
export class AppModule {}
