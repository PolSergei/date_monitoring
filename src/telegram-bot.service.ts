import { Injectable } from '@nestjs/common';
import TelegramBot = require("node-telegram-bot-api");
import * as fs from 'fs';

enum ChatIdAction {
    store,
    clear
}

@Injectable()
export class TelegramBotService {
    private bot: TelegramBot;
    private storageFilePath = `${process.cwd()}/list_chat_id.json`;
    private subscribePassphrase: string = process.env.TELEGRAM_BOT_SUBSCRIBE_PASSPHRASE;

    constructor() {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        this.bot = new TelegramBot(token, {polling: true});

        console.log("TelegramBot created");
    }

    Start() {
        console.log("TelegramBot started");

        this.bot.on('message', async msg => {
            const text = msg.text;
            const chatId = msg.chat.id;

            console.log(text);

            // todo стоит ли делать более удобный интерфейс боту
            try {
                const subscibeCommand = `/subscribe ${this.subscribePassphrase}`;
                if(text === subscibeCommand) {
                    this.UpdateChatIdStorage(chatId, ChatIdAction.store);
                    this.bot.sendMessage(chatId, 'You successfully subscribed.');
                } else if(text === '/unsubsribe') {
                    this.UpdateChatIdStorage(chatId, ChatIdAction.clear);
                    this.bot.sendMessage(chatId, 'You unsubscribed.');
                }
            } catch (e) {
                console.log(`Telegram Bot error in chat ${chatId}`);
            }
        })
    }

    EmitEvent() {
        if(fs.existsSync( this.storageFilePath )) {
            const contentFile = fs.readFileSync(this.storageFilePath);
            let listChats: Array<number> = JSON.parse(contentFile.toString());

            for (let chatId of listChats) {
                this.bot.sendMessage(chatId, 'There are available dates!');
            }
        }
        else {
            console.log(`Error: ${this.storageFilePath} don't exist`);
        }
    }

    private UpdateChatIdStorage(chatId: number, action: ChatIdAction){
        let listChats: Array<number> = [];

        if(fs.existsSync( this.storageFilePath )) {
            const contentFile = fs.readFileSync(this.storageFilePath);
            listChats = JSON.parse(contentFile.toString());

            const found = listChats.findIndex(element => element == chatId);

            // Adding chartId in the existing file
            if(action == ChatIdAction.store) {
                if(found == -1) {
                    listChats.push(chatId);
                }
            }
            // Removing chartId from the existing file
            if(action == ChatIdAction.clear){
                if(found != -1) {
                    delete listChats[found];
                }
            }
        }
        else {
            // Adding chartId in a new file
            if(action == ChatIdAction.store) {
                listChats.push(chatId);
            }
        }

        fs.writeFileSync(this.storageFilePath, JSON.stringify(listChats));
    }
}
