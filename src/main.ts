import {ConfigModule} from "@nestjs/config"
import {NestFactory} from "@nestjs/core";
import {TestBackModule} from "./testBackModule";
import * as cookieParser from "cookie-parser";
import {MainModule} from "./main.module";
import {DateCheckerService} from "./date-checker/date-checker.service";

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'production') {
    ConfigModule.forRoot({
        envFilePath: `.${process.env.NODE_ENV}.env`
    });
}

async function bootstrap() {
    let testPort = 3000;
    if (process.env.NODE_ENV === 'development') {
        testPort = Number(process.env.TEST_PORT);
    }
    const testBack = await NestFactory.create(TestBackModule);
    testBack.use(cookieParser());
    await testBack.listen(testPort);

    const mainModule = await NestFactory.createApplicationContext(MainModule);
    const dateChecker = mainModule.get(DateCheckerService);
    await dateChecker.startChecking();
}

bootstrap();
