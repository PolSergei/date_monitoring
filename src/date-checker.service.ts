import {Injectable} from '@nestjs/common';
import {AxiosError} from "axios";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";
import {PageEmbassyService} from "./page-embassy.service";

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

        this.telegramBot.Start();

        // First check just after start
        await this.checkAvailableDate();

        // Other checks
        setInterval(() => this.checkAvailableDate(), Number(process.env.REFRESH_TIME));
    }

    private async checkAvailableDate() {
        try {
            await this.passCaptcha();

            let datesExist = this.embassy.isFreeDatesOnPage();

            if (datesExist) {
                console.log("INFO: Dates was found on the first page");
                this.telegramBot.EmitEvent();
            } else {
                console.log("INFO: There aren't free dates on the first page.");

                await this.embassy.loadNextBookingPage();

                datesExist = this.embassy.isFreeDatesOnPage();

                if (datesExist) {
                    console.log("INFO: Dates was found on the second page");
                    this.telegramBot.EmitEvent();
                } else {
                    console.log("INFO: There aren't free dates on the second page.");

                    await this.embassy.loadNextBookingPage();

                    datesExist = this.embassy.isFreeDatesOnPage();

                    if (datesExist) {
                        console.log("INFO: Dates was found on the third page");
                        this.telegramBot.EmitEvent();
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
