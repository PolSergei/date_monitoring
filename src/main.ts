import {ConfigModule} from "@nestjs/config"
import {checkAvailableDate, TelegramBotStart } from './main.controller';
import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";
import * as cookieParser from "cookie-parser";

ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`
});


async function bootstrap() {
    if(process.env.NODE_ENV == 'development'){
        // todo Описать код и файлы, так что бы было понятно что это бэе / сервер
        // todo Убрать ошибки подсветки
        const app = await NestFactory.create(AppModule);
        app.use(cookieParser());
        app.listen(Number(process.env.TEST_PORT));
    }
    // First check just after start
    await checkAvailableDate();

    // Other checks
    setInterval(() => checkAvailableDate(), Number(process.env.REFRESH_TIME));
   // TelegramBotStart();
}

bootstrap();
