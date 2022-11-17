import {AxiosError, AxiosResponse, Axios} from "axios";
import TelegramBot = require("node-telegram-bot-api");


export function getCaptchaPage() {
    const axios = new Axios({baseURL: 'https://service2.diplo.de'});
    axios.get(
        '/rktermin/extern/appointment_showMonth.do?locationCode=tifl&realmId=744&categoryId=1344'
    )
        .then(function (resp: AxiosResponse) {
            console.log(resp);
        })
        .catch(function (err: AxiosError) {
            console.log(err);
        });
};

export function TelegramBotStart() {
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

};