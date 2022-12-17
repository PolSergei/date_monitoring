import { Module } from '@nestjs/common';
import {DateCheckerService} from "./date-checker.service";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";

@Module({
    providers: [DateCheckerService, TelegramBotService, RuCaptchaService],
    exports: [DateCheckerService],
    controllers: []
})
export class MainModule {}
