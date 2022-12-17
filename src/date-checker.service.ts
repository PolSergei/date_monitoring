import {Injectable} from '@nestjs/common';
import {AxiosError} from "axios";
import {TelegramBotService} from "./telegram-bot.service";
import {RuCaptchaService} from "./ru-captcha.service";

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

    // todo Вынести методы
    private async checkAvailableDate() {
        try {

            const captchaPage = await DateCheckerService.getCaptchaPage();
            const captchaText = await DateCheckerService.getCaptchaCode(captchaPage.data);

            const captchaPageCookie = DateCheckerService.getCookie(captchaPage.headers["set-cookie"]);
            const firstBookingPage = await DateCheckerService.getFirstPageData(captchaPageCookie, captchaText);

            const isCaptchaValid = DateCheckerService.isCaptchaValid(firstBookingPage);

            if (isCaptchaValid) {
                // todo Продолжаем выполнение
            } else {

                // todo: Отослать рукапче предъяву
                // todo Найти новую капчу
                // todo Послать новую капчу на проверку
            }

            console.log(firstBookingPage);

            let datesExist = DateCheckerService.isFreeDatesOnPage(firstBookingPage);

            if (datesExist) {
                this.telegramBot.EmitEvent();
            } else {
                console.log("There aren't free dates on the first page.");

                let nextPath = DateCheckerService.getNextPath(firstBookingPage);
                let nextURL = `${process.env.EMBASSY_URL}/rktermin/${nextPath}`

                let secondBookingPage = await DateCheckerService.getSecondPageData(captchaPageCookie, nextURL);

                datesExist = DateCheckerService.isFreeDatesOnPage(secondBookingPage);

                if (datesExist) {
                    this.telegramBot.EmitEvent();
                } else {
                    console.log("There aren't free dates on the second page.");

                    nextPath = DateCheckerService.getNextPath(secondBookingPage.data);
                    nextURL = `${process.env.EMBASSY_URL}/rktermin/${nextPath}`

                    secondBookingPage = await DateCheckerService.getSecondPageData(captchaPageCookie, nextURL);

                    datesExist = DateCheckerService.isFreeDatesOnPage(secondBookingPage);

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

    private static isCaptchaValid(page: string): boolean {
        const captchaWrongStr = 'The entered text was wrong';

        const isCaptchaWrong = page.includes(captchaWrongStr);

        return !isCaptchaWrong;
    }

    private static async getCaptchaPage(): Promise<any> {

        const captchaPageUrl = process.env.EMBASSY_URL + '/rktermin/extern/appointment_showMonth.do?locationCode=tifl&realmId=744&categoryId=1344';
        const captchaPage = await axios.request({
            method: 'get',
            url: captchaPageUrl,
            responseType: 'json',
            headers: {'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'},
        });

        console.log(`Successful GET request to ${captchaPageUrl}`);

        return captchaPage;
    }

    private static async getCaptchaCode(captchaPageData: any): Promise<string> {

        // Блок получение кода капчи
        const captchaImage = DateCheckerService.findCaptchaImage(captchaPageData);

        const objRuCaptchaService = new RuCaptchaService();

        const captchaText = await objRuCaptchaService.getCaptcha(captchaImage);

        return captchaText;
    }

    private static async getFirstPageData(captchaPageCookie: string, captchaText: string): Promise<any> {
        const bookingPageUrl = process.env.EMBASSY_URL + '/rktermin/extern/appointment_showMonth.do';

        const bookingPageRequestData = `captchaText=${captchaText}&rebooking=&token=&lastname=&firstname=&email=
            &locationCode=tifl&realmId=744&categoryId=1344&openingPeriodId=&date=&dateStr=
            &action%3Aappointment_showMonth=Continue`;

        const firstbookingPage = await axios.request({
            method: 'post',
            headers: {
                'Cookie': captchaPageCookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: bookingPageUrl,
            responseType: 'json',
            data: bookingPageRequestData
        });

        return firstbookingPage.data;
    }

    private static async getSecondPageData(captchaPageCookie: string, nextURL: string): Promise<any> {

        const secondbookingPage = await axios.request({
            method: 'get',
            headers: {
                'Cookie': captchaPageCookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: nextURL,
            responseType: 'json',
        });

        return secondbookingPage.data;
    }

    private static findCaptchaImage(responseData: string): string {
        const startStr = 'url(\'data:image/jpg;base64,';
        const pos1 = responseData.indexOf(startStr) + startStr.length;
        const pos2 = responseData.indexOf('\') no-repeat scroll');

        if (pos1 < pos2) {
            const res = responseData.slice(pos1, pos2);
            console.log("Captcha image was found");
            return res;
        } else {
            throw("Error: Captcha image wasn't found");
        }
    }

    private static getCookie(headers: Array<string>): string {
        const jsessionid = headers[0].split(';')[0];
        const keks = headers[1].split(';')[0];

        return jsessionid + ';' + keks;
    }

    private static isFreeDatesOnPage(page: string): boolean {
        const notDatesMessage = 'Unfortunately, there are no appointments available at this time. ' +
            'New appointments will be made available for booking at regular intervals.'

        const datesNotExist = page.includes(notDatesMessage);

        return !datesNotExist;
    }

    private static getNextPath(page: string): string {
        const startStr = 'onclick="return startCommitRequest();"';
        const hrefStr = 'href="';

        // Search the position of the first occurrence of a startStr
        const pos1 = page.indexOf(startStr) + startStr.length;
        // Search the position of the second occurrence of a startStr
        const pos2 = page.indexOf(startStr, pos1) + startStr.length;
        // Search the position of hrefStr.
        const pos3 = page.indexOf(hrefStr, pos2) + hrefStr.length;
        const pos4 = page.indexOf('"', pos3);

        if (pos3 < pos4) {
            const res = page.slice(pos3, pos4);
            console.log("Next URL:");
            console.log(res);
            return res;
        } else {
            throw("Error: The next button URL haven't been found");
        }
    }
}
