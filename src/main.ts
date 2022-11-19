import {ConfigModule} from "@nestjs/config"
import {checkBooking, TelegramBotStart } from './main.controller';
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";

ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`
});


async function bootstrap() {
    if(process.env.NODE_ENV == 'development'){
        const app = await NestFactory.create(AppModule);
        app.listen(Number(process.env.TEST_PORT));
    }
    // First check just after start
    await checkBooking();

    // Other checks
    setInterval(() => checkBooking(), Number(process.env.REFRESH_TIME));
   // TelegramBotStart();
}

bootstrap();
