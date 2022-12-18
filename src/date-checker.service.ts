import {Injectable} from '@nestjs/common';
import {AxiosError} from "axios";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";
import {PageEmbassyService} from "./page-embassy.service";

const axios = require('axios');

@Injectable()
export class DateCheckerService {
    constructor(private telegramBot: TelegramBotService) {
    }

    async startChecking() {
        console.log("DateChecker started");

        this.telegramBot.Start();

        // First check just after start
        await this.checkAvailableDate();

        // Other checks
        setInterval(() => this.checkAvailableDate(), Number(process.env.REFRESH_TIME));
    }

    private async checkAvailableDate() {
        try {

            const objPageEmbassyService = new PageEmbassyService();

            const captchaImage = await objPageEmbassyService.loadCaptchaImage();

            const objRuCaptchaService = new RuCaptchaService();
            const captchaText = await objRuCaptchaService.getCaptcha(captchaImage);

            await objPageEmbassyService.loadFirstBookingPage(captchaText);

            const isCaptchaValid = objPageEmbassyService.isCaptchaValid();

            if (isCaptchaValid) {
                // todo Продолжаем выполнение
            } else {

                // todo: Отослать рукапче предъяву
                // todo Найти новую капчу
                // todo Послать новую капчу на проверку
            }

            let datesExist = objPageEmbassyService.isFreeDatesOnPage();

            if (datesExist) {
                this.telegramBot.EmitEvent();
            } else {
                console.log("There aren't free dates on the first page.");

                await objPageEmbassyService.loadNextBookingPage();

                datesExist = objPageEmbassyService.isFreeDatesOnPage();

                if (datesExist) {
                    this.telegramBot.EmitEvent();
                } else {
                    console.log("There aren't free dates on the second page.");

                    await objPageEmbassyService.loadNextBookingPage();

                    datesExist = objPageEmbassyService.isFreeDatesOnPage();

                    if (datesExist) {
                        this.telegramBot.EmitEvent();
                    } else {
                        console.log("There aren't free dates on the third page.");
                    }
                }
             }

        } catch (e) {
            if (e instanceof AxiosError) {
                console.log(`Error loading ${process.env.EMBASSY_URL}`);
            } else {
                console.log(e);
            }
        }
    }

}
