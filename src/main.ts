import {ConfigModule} from "@nestjs/config"
import {checkBooking, TelegramBotStart } from './main.controller';

ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`
});


async function bootstrap() {
    // First check just after start
    await checkBooking();

    // Other checks
    setInterval(() => checkBooking(), Number(process.env.REFRESH_TIME));
   // TelegramBotStart();
}

bootstrap();
