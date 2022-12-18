import {Injectable} from "@nestjs/common";

const axios = require('axios');

@Injectable()
export class PageEmbassyService {

    private _currentBookingPage: any;
    private _cookie: string;

    public async loadCaptchaImage(): Promise<string> {
        const captchaPage = await this.getCaptchaPage();
        this.setCookie(captchaPage.headers["set-cookie"]);
        const captchaImage = this.findCaptchaImage(captchaPage.data);

        return captchaImage;
    }

    private findCaptchaImage(captchaPageData: string): string {
        const startStr = 'url(\'data:image/jpg;base64,';
        const pos1 = captchaPageData.indexOf(startStr) + startStr.length;
        const pos2 = captchaPageData.indexOf('\') no-repeat scroll');

        if (pos1 < pos2) {
            const res = captchaPageData.slice(pos1, pos2);
            console.log("Captcha image was found");
            return res;
        } else {
            throw("Error: Captcha image wasn't found");
        }
    }

    private setCookie(headers: Array<string>) {
        const jsessionid = headers[0].split(';')[0];
        const keks = headers[1].split(';')[0];

        this._cookie = jsessionid + ';' + keks;

        console.log('this._cookie', this._cookie);
    }

    private async getCaptchaPage(): Promise<any> {

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

    public async loadFirstBookingPage(captchaText: string): Promise<any> {
        const bookingPageUrl = process.env.EMBASSY_URL + '/rktermin/extern/appointment_showMonth.do';

        const bookingPageRequestData = `captchaText=${captchaText}&rebooking=&token=&lastname=&firstname=&email=
            &locationCode=tifl&realmId=744&categoryId=1344&openingPeriodId=&date=&dateStr=
            &action%3Aappointment_showMonth=Continue`;

        const firstbookingPage = await axios.request({
            method: 'post',
            headers: {
                'Cookie': this._cookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: bookingPageUrl,
            responseType: 'json',
            data: bookingPageRequestData
        });

        this._currentBookingPage = firstbookingPage;
    }

    public isFreeDatesOnPage(): boolean {
        const notDatesMessage = 'Unfortunately, there are no appointments available at this time. ' +
            'New appointments will be made available for booking at regular intervals.'

        const datesNotExist = this._currentBookingPage.data.includes(notDatesMessage);

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
            console.log("Next URL:");
            console.log(res);
            return res;
        } else {
            throw("Error: The next button URL haven't been found");
        }
    }

    public async loadNextBookingPage() {
        const nextPath = this.getNextPath(this._currentBookingPage);
        const nextURL = `${process.env.EMBASSY_URL}/rktermin/${nextPath}`;

        const nextBookingPage = await axios.request({
            method: 'get',
            headers: {
                'Cookie': this._cookie,
                'Accept-Language': 'en-US,en;q=0.9,ru;q=0.8'
            },
            url: nextURL,
            responseType: 'json',
        });

        this._currentBookingPage = nextBookingPage;
    }

    public isCaptchaValid(): boolean {
        const captchaWrongStr = 'The entered text was wrong';

        const isCaptchaWrong = this._currentBookingPage.data.includes(captchaWrongStr);

        return !isCaptchaWrong;
    }

}
