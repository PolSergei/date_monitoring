import {Injectable} from "@nestjs/common";
import {AxiosError, AxiosResponse} from "axios";
import {sleep} from "./utils";

const axios = require('axios');

// TODO удалить префикс rucaptcha из названий методов
@Injectable()
export class RuCaptchaService {
    private readonly taskUrl = process.env.RECAPTCHA_BASE_URL + '/in.php';
    private readonly resultUrl = process.env.RECAPTCHA_BASE_URL + '/res.php';

    private tackId: string;

    public async getCaptcha(captchaImage: string): Promise<any> {

        const ruCaptchaRequestData = await this.setTask(captchaImage);

        if (ruCaptchaRequestData && ruCaptchaRequestData.status === 1) {
            this.tackId = ruCaptchaRequestData.request;
            console.log('INFO: RuCaptcha request number: ' + this.tackId);

            const captchaText: string = await this.getResult();
            console.log('INFO: RuCaptcha result: ' + captchaText);
            return captchaText;

        } else {
            throw(Error(`${this.taskUrl} returned: ${JSON.stringify(ruCaptchaRequestData)}`));
        }
    }

    public async sendCaptchaGood() {
        await axios.request({
            method: 'get',
            url: this.resultUrl,
            params: {
                key: process.env.RECAPTCHA_KEY,
                action: 'reportgood',
                id: this.tackId,
                json: 1
            },
            responseType: 'json'
        })
            .then(function (reCaptchaResult: AxiosResponse) {

                if (reCaptchaResult.data.status !== 1) {
                    console.log('After sending method sendCaptchaGood get error: ' + reCaptchaResult.data.request);
                    // todo В лог
                    // todo Подумать как реагировать
                }
            })
            .catch(function (e: AxiosError) {
                // todo Можно вызвать fall service
            });
    }

    public async sendCaptchaBad() {
        await axios.request({
            method: 'get',
            url: this.resultUrl,
            params: {
                key: process.env.RECAPTCHA_KEY,
                action: 'reportbad',
                id: this.tackId,
                json: 1
            },
            responseType: 'json'
        })
            .then(function (reCaptchaResult: AxiosResponse) {

                if (reCaptchaResult.data.status !== 1) {
                    console.log('After sending method sendCaptchaBad get error: ' + reCaptchaResult.data.request);
                    // todo В лог
                    // todo Подумать как реагировать
                }
            })
            .catch(function (e: AxiosError) {
                // todo Можно вызвать fall service
            });
    }

    private async setTask(captchaImage: string): Promise<any> {
        let result = false;
        await axios.request({
            method: 'post',
            url: this.taskUrl,
            data: {
                method: 'base64',
                key: process.env.RECAPTCHA_KEY,
                body: captchaImage,
                json: 1
            },
            responseType: 'json'
        })
            .then(function (resp: AxiosResponse) {
                result = resp.data;
            });

        // TODO сейчас если будет ошибка axios то она будет перехвачена вызывающим кодом, подумать стоит ли что-то добавить
        return result;
    }

    private async getResult(): Promise<any> {
        let stopLoop = false;
        const maxAttempt = 10;
        const delay = 5000;
        let attempt = 0;
        let result;

        do{
            await axios.request({
                method: 'get',
                url: this.resultUrl,
                params: {
                    key: process.env.RECAPTCHA_KEY,
                    action: 'get',
                    id: this.tackId,
                    json: 1
                },
                responseType: 'json'
            })
                .then(async (reCaptchaResult: AxiosResponse) => {
                    if (reCaptchaResult.data.status === 1) {
                        stopLoop = true;
                        result = reCaptchaResult.data.request;
                    } else {
                        console.log(`INFO: RuCaptcha returned ${reCaptchaResult.data.request} at ${attempt + 1} attempt get result.`);
                        attempt++;
                        if (attempt >= maxAttempt) {
                            throw(Error(`No result received after ${maxAttempt} attempts`));
                        }
                        await sleep(delay);
                        // записать в лог JSON.stringify(reCaptchaResult.data) вызвать fall service
                        // Сергей писал типо такого console.log(`At ${attempt + 1} attempt rucaptcha returned ${JSON.stringify(reCaptchaResult.data)}`);
                    }
                });
        }while (!stopLoop)

        return result;
    }

}