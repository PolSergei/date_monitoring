import { Injectable } from '@nestjs/common';
import TelegramBot = require("node-telegram-bot-api");

@Injectable()
export class TelegramBotService {
    // Todo  Вынести в отдельный контроллер
    TelegramBotStart() {
        console.log("TelegramBot started");

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const passphrase = process.env.TELEGRAM_BOT_PASSPHRASE;

        const bot = new TelegramBot(token, {polling: true});

        bot.on('message', async msg => {
            const text = msg.text;
            const chatId = msg.chat.id;

            try {
                if (text === '/start') {
                    bot.sendMessage(chatId, `Привет! Ты кто по жизни?`);
                } else {
                    if (text === passphrase) {
                        bot.sendMessage(chatId, `Супер! Готов работать! :)`);
                        setInterval(() => bot.sendMessage(chatId, `Спам парам пам пам!`), 1000);
                    } else {
                        bot.sendMessage(chatId, ` С такими не работаю! `);
                    }
                }

            } catch (e) {
                return bot.sendMessage(chatId, 'Произошла какая то ошибка!)');
            }

        })

    }
}
