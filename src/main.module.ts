import { Module } from '@nestjs/common';
import {DateCheckerService} from "./date-checker/date-checker.service";
import {TelegramBotService} from "./telegram-bot.service";

@Module({
    providers: [DateCheckerService, TelegramBotService],
    exports: [DateCheckerService],
    controllers: []
})
export class MainModule {}
