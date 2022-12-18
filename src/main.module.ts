import { Module } from '@nestjs/common';
import {DateCheckerService} from "./date-checker.service";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";
import {PageEmbassyService} from "./page-embassy.service";

@Module({
    providers: [DateCheckerService, TelegramBotService, RuCaptchaService, PageEmbassyService],
    exports: [DateCheckerService],
    controllers: []
})
export class MainModule {}
