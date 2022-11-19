import {AxiosError, AxiosResponse, Axios} from "axios";
import TelegramBot = require("node-telegram-bot-api");

// app.post('/in.php', function (req, res) {
//     res.json({"status":1,"request":"2122988149"});
//     // res.json({"status":0,"request":"ERROR_EMPTY_ACTION"});
// })
// app.get('/res.php', function(req, res) {
//     res.json({"status":1,"request":"7bxmpg"});
//     //res.json({"status":0,"request":"CAPCHA_NOT_READY"});
// })

export async function checkBooking() {

    const axios = require('axios');

    try {
        let captchaPage = await axios.request({
                                        method: 'get',
                                        url: process.env.TARGET_URL,
                                        responseType: 'json'
                                        });
        console.log(`Successful request to ${process.env.TARGET_URL}`);
        const responseData = captchaPage.data;
        const captchaImage = findCaptchaImage(responseData);
        const captchaText = await getRuCaptchaResult(captchaImage);

    } catch (e) {
        if(e instanceof AxiosError) {
            console.log(`Error loading ${process.env.TARGET_URL}`);
        }
        else {
            console.log(e);
        }
    }

    function findCaptchaImage(responseData: string): string {
        const startStr = 'url(\'data:image/jpg;base64,';

        //jpg;base64
        const pos1 = responseData.indexOf(startStr) + startStr.length;
        //console.log(pos1);

        const pos2 = responseData.indexOf('\') no-repeat scroll');
        //console.log(pos2);

        if(pos1 < pos2) {
            const res = responseData.slice(pos1, pos2);
            console.log("Captcha image was found");
            //console.log(res);
            return res;
        }
        else{
            throw("Error: Captcha image wasn't found");
        }
    }

    async function getRuCaptchaResult(captchaImage: string) {

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

            if(ruCaptchaRequest.data.status === 1){
                console.log('Rucaptcha request number: ' + ruCaptchaRequest.data.request);

                let stopLoop = false;
                const maxAttempt = 10;
                let attempt = 0;
                const resultUrl = process.env.RECAPTCHA_BASE_URL + '/res.php';

                while(!stopLoop && attempt < maxAttempt){
                    try{
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        let reCaptchaResult = await axios.request({
                            method: 'get',
                            url: resultUrl,
                            data: {
                                key: process.env.RECAPTCHA_KEY,
                                action: 'get',
                                id: ruCaptchaRequest.data.request,
                                json: 1
                            },
                            responseType: 'json' });

                        if(reCaptchaResult.data.status === 1){
                            console.log('Rucaptcha result: ' + reCaptchaResult.data.request);
                            stopLoop = true;
                            result = reCaptchaResult.data.request;
                        }
                        else {
                            console.log(`At ${attempt + 1} attempt rucaptcha returned ${JSON.stringify(reCaptchaResult.data)}`);
                        }
                    }
                    catch (e){
                        console.log(`Error loading ${resultUrl} at ${attempt +1 } attempt`);
                    }
                    attempt++;
                }

                if(attempt >= maxAttempt) {
                    throw(`No result received after ${maxAttempt} attempts`);
                }
            }
            else {
                throw(`${taskUrl} returned: ${JSON.stringify(ruCaptchaRequest.data)}`);
            }
        }
        catch (e) {
            if(e instanceof AxiosError) {
                console.log(`Error loading ${taskUrl}`);
            }
            else {
                console.log(e);
            }
        }

        return result;
    }
};


export function TelegramBotStart() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const passphrase = process.env.TELEGRAM_BOT_PASSPHRASE;

    const bot = new TelegramBot(token, {polling: true});

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;

        try {
            if (text === '/start') {
                bot.sendMessage(chatId, `Привет! Ты кто по жизни?`);
            } else {
                if (text === passphrase) {
                    bot.sendMessage(chatId, `Супер! Готов работать! :)`);
                    setInterval(() => bot.sendMessage(chatId, `Спам парам пам пам!`), 1000);
                } else {
                    bot.sendMessage(chatId, ` С такими не работаю! `);
                }
            }

        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка!)');
        }

    })

};