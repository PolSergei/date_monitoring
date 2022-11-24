import { Module } from '@nestjs/common';
import {DateCheckerService} from "./date-checker/date-checker.service";
import {TelegramBotService} from "./telegram-bot-service/telegram-bot.service";

@Module({
    providers: [DateCheckerService, TelegramBotService],
    exports: [DateCheckerService]
})
export class MainModule {}
