import {ConfigModule} from "@nestjs/config"
import {getCaptchaPage, TelegramBotStart } from './main.controller';

ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`
});


async function bootstrap() {
   setTimeout(() => console.log("1 sec"), 1000);
  // setTimeout(() => getCaptchaPage(), 2000);
  //getCaptchaPage();
    TelegramBotStart();
}

bootstrap();
