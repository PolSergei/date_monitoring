import { Injectable } from '@nestjs/common';
import {readFileSync} from 'fs'

@Injectable()
export class EmbassyService {
    pageWithCaptcha(): string {
        const captchaPage = readFileSync(process.cwd() + '/test_data/captcha_page.html');
        return captchaPage.toString();
    }

    datesPage(): string {
        const datesPage = readFileSync((process.cwd() + '/test_data/dates.html'));
        return datesPage.toString();
    }
}

