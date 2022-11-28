import {Injectable} from '@nestjs/common';
import {AxiosError} from "axios";
import {TelegramBotService} from "../telegram-bot-service/telegram-bot.service";

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
            const captchaPageUrl = process.env.TARGET_URL + '/rktermin/extern/appointment_showMonth.do?locationCode=tifl&realmId=744&categoryId=1344';
            const captchaPage = await axios.request({
                method: 'get',
                url: captchaPageUrl,
                responseType: 'json',
                headers: {'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'},
            });

            console.log(`Successful GET request to ${captchaPageUrl}`);
            const captchaPageCookie = DateCheckerService.getCookie(captchaPage.headers["set-cookie"]);
            const responseData = captchaPage.data;

            const captchaImage = DateCheckerService.findCaptchaImage(responseData);
            const captchaText = await DateCheckerService.getRuCaptchaResult(captchaImage);

            const bookingPageUrl = process.env.TARGET_URL + '/rktermin/extern/appointment_showMonth.do';
            const data = `captchaText=${captchaText}&rebooking=&token=&lastname=&firstname=&email=&locationCode=tifl&realmId=744&categoryId=1344&openingPeriodId=&date=&dateStr=&action%3Aappointment_showMonth=Continue`;
            let bookingPage = await axios.request({
                method: 'post',
                headers: {
                    'Cookie': captchaPageCookie,
                    'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
                },
                url: bookingPageUrl,
                responseType: 'json',
                data: data
            });

            let datesExist = DateCheckerService.isFreeDatesOnPage(bookingPage.data);

            if (datesExist) {
                this.telegramBot.EmitEvent();
            } else {
                console.log("There aren't free dates on the first page.");

                let nextPath = DateCheckerService.getNextPath(bookingPage.data);
                let nextURL = `${process.env.TARGET_URL}/rktermin/${nextPath}`

                bookingPage = await axios.request({
                    method: 'get',
                    headers: {
                        'Cookie': captchaPageCookie,
                        'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
                    },
                    url: nextURL,
                    responseType: 'json',
                });

                datesExist = DateCheckerService.isFreeDatesOnPage(bookingPage.data);
                if (datesExist) {
                    this.telegramBot.EmitEvent();
                } else {
                    console.log("There aren't free dates on the second page.");

                    nextPath = DateCheckerService.getNextPath(bookingPage.data);
                    nextURL = `${process.env.TARGET_URL}/rktermin/${nextPath}`

                    bookingPage = await axios.request({
                        method: 'get',
                        headers: {
                            'Cookie': captchaPageCookie,
                            'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
                        },
                        url: nextURL,
                        responseType: 'json',
                    });

                    datesExist = DateCheckerService.isFreeDatesOnPage(bookingPage.data);
                    if (datesExist) {
                        this.telegramBot.EmitEvent();
                    } else {
                        console.log("There aren't free dates on the third page.");
                    }
                }
            }


        } catch (e) {
            if (e instanceof AxiosError) {
                console.log(`Error loading ${process.env.TARGET_URL}`);
            } else {
                console.log(e);
            }
        }
    }

    private static findCaptchaImage(responseData: string): string {
        const startStr = 'url(\'data:image/jpg;base64,';
        const pos1 = responseData.indexOf(startStr) + startStr.length;
        const pos2 = responseData.indexOf('\') no-repeat scroll');

        if (pos1 < pos2) {
            const res = responseData.slice(pos1, pos2);
            console.log("Captcha image was found");
            //console.log(res);
            return res;
        } else {
            throw("Error: Captcha image wasn't found");
        }
    }

    private static async getRuCaptchaResult(captchaImage: string): Promise<any> {

        const taskUrl = process.env.RECAPTCHA_BASE_URL + '/in.php';
        let result;
        try {
            let ruCaptchaRequest = await axios.request({
                method: 'post',
                url: taskUrl,
                data: {
                    method: 'base64',
                    key: process.env.RECAPTCHA_KEY,
                    body: captchaImage,
                    json: 1
                },
                responseType: 'json'
            });

            if (ruCaptchaRequest.data.status === 1) {
                console.log('Rucaptcha request number: ' + ruCaptchaRequest.data.request);

                let stopLoop = false;
                const maxAttempt = 10;
                let attempt = 0;
                const resultUrl = process.env.RECAPTCHA_BASE_URL + '/res.php';

                while (!stopLoop && attempt < maxAttempt) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        let reCaptchaResult = await axios.request({
                            method: 'get',
                            url: resultUrl,
                            params: {
                                key: process.env.RECAPTCHA_KEY,
                                action: 'get',
                                id: ruCaptchaRequest.data.request,
                                json: 1
                            },
                            responseType: 'json'
                        });

                        if (reCaptchaResult.data.status === 1) {
                            console.log('Rucaptcha result: ' + reCaptchaResult.data.request);
                            stopLoop = true;
                            result = reCaptchaResult.data.request;
                        } else {
                            console.log(`At ${attempt + 1} attempt rucaptcha returned ${JSON.stringify(reCaptchaResult.data)}`);
                        }
                    } catch (e) {
                        console.log(`Error loading ${resultUrl} at ${attempt + 1} attempt`);
                    }
                    attempt++;
                }

                if (attempt >= maxAttempt) {
                    throw(`No result received after ${maxAttempt} attempts`);
                }
            } else {
                throw(`${taskUrl} returned: ${JSON.stringify(ruCaptchaRequest.data)}`);
            }
        } catch (e) {
            if (e instanceof AxiosError) {
                console.log(`Error loading ${taskUrl}`);
            } else {
                console.log(e);
            }
        }

        return result;
    }

    private static getCookie(headers: Array<string>): string {
        const jsessionid = headers[0].split(';')[0];
        const keks = headers[1].split(';')[0];

        return jsessionid + ';' + keks;
    }

    private static isFreeDatesOnPage(page: string): boolean {
        const notDatesMessage = 'Unfortunately, there are no appointments available at this time. New appointments will be made available for booking at regular intervals.'

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
