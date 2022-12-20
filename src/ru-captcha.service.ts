import {Injectable} from "@nestjs/common";
import {AxiosError, AxiosResponse} from "axios";

const axios = require('axios');

// TODO удалить префикс rucaptcha из названий методов
@Injectable()
export class RuCaptchaService {

    private readonly _taskUrl = process.env.RECAPTCHA_BASE_URL + '/in.php';
    private readonly _resultUrl = process.env.RECAPTCHA_BASE_URL + '/res.php';

    private _tackId: string;

    public async getCaptcha(captchaImage: string): Promise<any> {

        //todo Проверить работу задержек. Похоже что сломались
        const ruCaptchaRequestData = await this.setTask(captchaImage);
        this._tackId = ruCaptchaRequestData.request;

        if (ruCaptchaRequestData && ruCaptchaRequestData.status === 1) {
            console.log('Rucaptcha request number: ' + this._tackId);
            return await this.getResult();

        } else {
            throw(`${this._taskUrl} returned: ${JSON.stringify(ruCaptchaRequestData)}`);
        }
    }

    public async sendCaptchaGood() {
        await axios.request({
            method: 'get',
            url: this._resultUrl,
            params: {
                key: process.env.RECAPTCHA_KEY,
                action: 'reportgood',
                id: this._tackId,
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
            url: this._resultUrl,
            params: {
                key: process.env.RECAPTCHA_KEY,
                action: 'reportbad',
                id: this._tackId,
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
            url: this._taskUrl,
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
            })
            .catch(function (e: AxiosError) {
                // todo Можно вызвать fall service
                if (e instanceof AxiosError) {
                    console.log(`Error loading ${this._taskUrl}`);
                } else {
                    console.log(e);
                }
            });

        return result;
    }

    private async getResult(): Promise<any> {

        //todo Над таймером и задержками нужно подумать

        let stopLoop = false;
        const maxAttempt = 10;
        let attempt = 0;

        while (!stopLoop && attempt < maxAttempt) {

            try {
                await axios.request({
                    method: 'get',
                    url: this._resultUrl,
                    params: {
                        key: process.env.RECAPTCHA_KEY,
                        action: 'get',
                        id: this._tackId,
                        json: 1
                    },
                    responseType: 'json'
                })
                    .then(function (reCaptchaResult: AxiosResponse) {

                        if (reCaptchaResult.data.status === 1) {
                            console.log('Rucaptcha result: ' + reCaptchaResult.data.request);
                            stopLoop = true;

                            return reCaptchaResult.data.request;
                        } else {
                            // записать в лог JSON.stringify(reCaptchaResult.data) вызвать fall service
                            // Сергей писал типо такого console.log(`At ${attempt + 1} attempt rucaptcha returned ${JSON.stringify(reCaptchaResult.data)}`);
                        }
                    })
                    .catch(function (e: AxiosError) {
                        // todo Можно вызвать fall service
                        // Сергей писал типо такого console.log(`Error loading ${_resultUrl} at ${attempt + 1} attempt`);
                    });
            } catch (e) {
                console.log(`Error loading ${this._resultUrl} at ${attempt + 1} attempt`);
            }
            attempt++;
        }

        if (attempt >= maxAttempt) {
            throw(`No result received after ${maxAttempt} attempts`);
        }
    }

}