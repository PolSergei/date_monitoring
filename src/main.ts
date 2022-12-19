import {ConfigModule} from "@nestjs/config"
import {NestFactory} from "@nestjs/core";
import {TestBackModule} from "../test_data/test-back-module";
import * as cookieParser from "cookie-parser";
import {MainModule} from "./main.module";
import {DateCheckerService} from "./date-checker.service";

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
    ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`,
        isGlobal: true
    });
}

async function bootstrap() {
    let port = 3010;
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
        port = Number(process.env.PORT);
    }
    const testBack = await NestFactory.create(TestBackModule);
    testBack.use(cookieParser());
    await testBack.listen(port);

    const mainModule = await NestFactory.createApplicationContext(MainModule);
    const dateChecker = mainModule.get(DateCheckerService);
    await dateChecker.startChecking();
}

bootstrap();
