import {Injectable} from "@nestjs/common";
import {AxiosError, AxiosResponse} from "axios";

const axios = require('axios');

@Injectable()
export class RuCaptchaService {

    private readonly taskUrl = process.env.RECAPTCHA_BASE_URL + '/in.php';

    private readonly resultUrl = process.env.RECAPTCHA_BASE_URL + '/res.php';

    public async getCaptcha(captchaImage: string): Promise<any> {

        const ruCaptchaRequestData = await this.ruCaptchaRequest(captchaImage);

        if (ruCaptchaRequestData && ruCaptchaRequestData.status === 1) {
            console.log('Rucaptcha request number: ' + ruCaptchaRequestData.request);
            return await this.ruCaptchaGetResult(ruCaptchaRequestData);

        } else {
            throw(`${this.taskUrl} returned: ${JSON.stringify(ruCaptchaRequestData)}`);
        }
    }

    private async ruCaptchaRequest(captchaImage: string): Promise<any> {

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
            })
            .catch(function (e: AxiosError) {
                // todo Можно вызвать fall service
                if (e instanceof AxiosError) {
                    console.log(`Error loading ${this.taskUrl}`);
                } else {
                    console.log(e);
                }
            });

        return result;
    }

    private async ruCaptchaGetResult(ruCaptchaRequestData: any): Promise<any> {

        //todo Над таймером и задержками нужно подумать
        let stopLoop = false;
        const maxAttempt = 10;
        let attempt = 0;

        while (!stopLoop && attempt < maxAttempt) {

            try {
                await axios.request({
                    method: 'get',
                    url: this.resultUrl,
                    params: {
                        key: process.env.RECAPTCHA_KEY,
                        action: 'get',
                        id: ruCaptchaRequestData.request,
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
                        // Сергей писал типо такого console.log(`Error loading ${resultUrl} at ${attempt + 1} attempt`);
                    });
            } catch (e) {
                console.log(`Error loading ${this.resultUrl} at ${attempt + 1} attempt`);
            }
            attempt++;
        }

        if (attempt >= maxAttempt) {
            throw(`No result received after ${maxAttempt} attempts`);
        }
    }

}