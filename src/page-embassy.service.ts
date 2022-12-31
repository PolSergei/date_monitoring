import {Injectable} from "@nestjs/common";
import {sleep} from "./utils";
import {AxiosError, AxiosResponse} from "axios";

const axios = require('axios');

@Injectable()
export class PageEmbassyService {

    private currentPage: any;
    private cookie: string;

    // todo может будет классно сделать функцию загрузчик
    public async loadCaptchaPage() {
        const captchaPageUrl = process.env.EMBASSY_URL + '/rktermin/extern/appointment_showMonth.do?locationCode=tifl&realmId=744&categoryId=1344';
        const maxAttempts = 5;
        const delay = 200;
        let attempt = 0;
        let isSuccessRequest = false;

        do {
            // todo Вынесу потом в отдельный метод
            await axios.request({
                method: 'get',
                url: captchaPageUrl,
                responseType: 'json',
                headers: {'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'},
            })
                .then((captchaPage: AxiosResponse) => {
                    isSuccessRequest = true;
                    console.log(this);

                    this.currentPage = captchaPage;
                    this.setCookie(captchaPage.headers["set-cookie"]);
                    console.log(`INFO: Successful GET request to ${captchaPageUrl}`);
                })
                .catch(async (e: AxiosError) => {
                    attempt++;
                    await sleep(delay);
                });
        }while (!isSuccessRequest && attempt < maxAttempts)

        if(!isSuccessRequest){
            throw Error(`ERROR: The captcha page ${captchaPageUrl} wasn't downloaded after ${maxAttempts} attempts.`)
        }
    }

    public findCaptchaImage(): string {
        const captchaPageData = this.currentPage.data;

        const startStr = 'url(\'data:image/jpg;base64,';
        const pos1 = captchaPageData.indexOf(startStr) ;
        const start = pos1 + startStr.length;

        const end = captchaPageData.indexOf('\') no-repeat scroll');

        if (pos1 !== -1 && end !== -1 && start < end) {
            const res = captchaPageData.slice(start, end);
            console.log("INFO: Captcha image was found");
            return res;
        } else {
            throw("Error: A captcha image wasn't found");
        }
    }

    private setCookie(headers: Array<string>) {
        const jsessionid = headers[0].split(';')[0];
        const keks = headers[1].split(';')[0];

        this.cookie = jsessionid + ';' + keks;
    }

    public async loadFirstBookingPage(captchaText: string){
        const bookingPageUrl = process.env.EMBASSY_URL + '/rktermin/extern/appointment_showMonth.do';

        const bookingPageRequestData = `captchaText=${captchaText}&rebooking=&token=&lastname=&firstname=&email=
            &locationCode=tifl&realmId=744&categoryId=1344&openingPeriodId=&date=&dateStr=
            &action%3Aappointment_showMonth=Continue`;

        this.currentPage = await axios.request({
            method: 'post',
            headers: {
                'Cookie': this.cookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: bookingPageUrl,
            responseType: 'json',
            data: bookingPageRequestData
        });
    }

    public isFreeDatesOnPage(): boolean {
        const notDatesMessage = 'Unfortunately, there are no appointments available at this time. ' +
            'New appointments will be made available for booking at regular intervals.'

        const datesNotExist = this.currentPage.data.includes(notDatesMessage);

        return !datesNotExist;
    }

    public getNextPath(page: string): string {
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
            console.log(`INFO: Next URL: ${res}`);
            return res;
        } else {
            throw(Error("ERROR: The next button URL haven't been found"));
        }
    }

    public async loadNextBookingPage() {
        const nextPath = this.getNextPath(this.currentPage.data);
        const nextURL = `${process.env.EMBASSY_URL}/rktermin/${nextPath}`;

        const nextBookingPage = await axios.request({
            method: 'get',
            headers: {
                'Cookie': this.cookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: nextURL,
            responseType: 'json',
        });

        this.currentPage = nextBookingPage;
    }

    public isCaptchaValid(): boolean {
        const captchaWrongStr = 'The entered text was wrong';

        const isCaptchaWrong = this.currentPage.data.includes(captchaWrongStr);

        return !isCaptchaWrong;
    }

}
