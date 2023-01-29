import { Injectable } from '@nestjs/common';
import {readFileSync} from 'fs'
import {sleep} from "../../src/utils";

@Injectable()
export class EmbassyService {
    async pageWithCaptcha(): Promise<string> {
        const captchaPage = readFileSync(process.cwd() + '/test_data/captcha-page.html');
        await sleep(500);
        return captchaPage.toString();
    }

    async datesPage(): Promise<string> {
        const datesPage = readFileSync((process.cwd() + '/test_data/dates.html'));
        await sleep(500);
        return datesPage.toString();
    }

    async wrongCaptcha(): Promise<string> {
        const datesPage = readFileSync((process.cwd() + '/test_data/wrong-captcha.html'));
        await sleep(500);
        return datesPage.toString();
    }
}

