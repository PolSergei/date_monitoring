import {Injectable} from '@nestjs/common';
import {AxiosError} from "axios";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";
import {PageEmbassyService} from "./page-embassy.service";
import {Job, scheduleJob} from 'node-schedule';

const axios = require('axios');

@Injectable()
export class DateCheckerService {
    constructor(
        private telegramBot: TelegramBotService,
        private ruCaptcha: RuCaptchaService,
        private embassy: PageEmbassyService
    ) { }

    async startChecking() {
        console.log("INFO: DateChecker started");
        const winkingFace = "\u{1F609}";

        this.telegramBot.Start();

        const statusTelegramBotJob : Job = scheduleJob('0 0 18 * * * ', () =>  {this.telegramBot.TransmitMessage("I'm working instead of you " + winkingFace)});

        const mainJob : Job = scheduleJob('0 */10 * * * * ', () => {this.checkAvailableDate()});
    }

    private async checkAvailableDate() {
        const availableMessage : string = 'There are available dates!';
        try {
            await this.passCaptcha();

            let datesExist = this.embassy.isFreeDatesOnPage();

            if (datesExist) {
                console.log("INFO: Dates was found on the first page");
                this.telegramBot.TransmitMessage(availableMessage);
            } else {
                console.log("INFO: There aren't free dates on the first page.");

                await this.embassy.loadNextBookingPage();

                datesExist = this.embassy.isFreeDatesOnPage();

                if (datesExist) {
                    console.log("INFO: Dates was found on the second page");
                    this.telegramBot.TransmitMessage(availableMessage);
                } else {
                    console.log("INFO: There aren't free dates on the second page.");

                    await this.embassy.loadNextBookingPage();

                    datesExist = this.embassy.isFreeDatesOnPage();

                    if (datesExist) {
                        console.log("INFO: Dates was found on the third page");
                        this.telegramBot.TransmitMessage(availableMessage);
                    } else {
                        console.log("INFO: There aren't free dates on the third page.");
                    }
                }
            }

        } catch (e) {
            // if (e instanceof RuCaptchaAttemptsError){
            //     console.log(e.message);
            //     // todo Отправить сообщение в телеграмм
            // } else
            if (e instanceof AxiosError) {
                console.log(`Error loading page: ${e.config.url}`);
                // todo Подумать нужно ли об этом информировать в телеге
            } else {
                console.log(e);
            }
        }
    }

    private async passCaptcha(){
        await this.embassy.loadCaptchaPage();

        const maxAttempts = 5;
        let attempt = 0;
        let isCaptchaValid = false;

        do {
            const captchaImage = this.embassy.findCaptchaImage();
            const captchaText = await this.ruCaptcha.getCaptcha(captchaImage);

            await this.embassy.loadFirstBookingPage(captchaText);
            isCaptchaValid = this.embassy.isCaptchaValid();

            if (isCaptchaValid) {
                await this.ruCaptcha.sendCaptchaGood();
            } else {
                console.log("INFO: captcha isn't valid")
                await this.ruCaptcha.sendCaptchaBad();
            }

            attempt++;
        }while (!isCaptchaValid && attempt < maxAttempts)

        if(!isCaptchaValid){
            throw new RuCaptchaAttemptsError(`The captcha wasn't passed after ${maxAttempts} attempts.`);
        }
    }
}

class RuCaptchaAttemptsError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, RuCaptchaAttemptsError.prototype);
    }
}
