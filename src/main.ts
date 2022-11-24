import {ConfigModule} from "@nestjs/config"
import {NestFactory} from "@nestjs/core";
import {externalBackModule} from "./external.back.module";
import * as cookieParser from "cookie-parser";
import {MainModule} from "./main.module";
import {DateCheckerService} from "./date-checker/date-checker.service";

ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`
});


async function bootstrap() {
    if(process.env.NODE_ENV == 'development'){
        // todo Описать код и файлы, так что бы было понятно что это бэе / сервер
        // todo Убрать ошибки подсветки
        const externalBack = await NestFactory.create(externalBackModule);
        externalBack.use(cookieParser());
        let back = externalBack.listen(Number(process.env.TEST_PORT));
    }

    const mainModule = await NestFactory.createApplicationContext(MainModule);
    const dateChecker = mainModule.get(DateCheckerService);
    await dateChecker.startChecking();

}

bootstrap();
