import { Injectable } from '@nestjs/common';
import {sleep} from "../../src/utils";

// Файл для тестирования.
@Injectable()
export class RuCaptchaService {
    async setTask(): Promise<string> {
        const data = {"status":1, "request":"2122988149"};
        //const data = {"status":0,"request":"ERROR_EMPTY_ACTION"};
        await sleep(500);
        return JSON.stringify(data);
    }

    async getResult(): Promise<string> {
        const data = {"status":1,"request":"7bxmpg"};
        //const data = {"status":0,"request":"CAPCHA_NOT_READY"};

        await sleep(500);
        return JSON.stringify(data);
    }

    async acceptedBadRequest(): Promise<string> {
        const data = {"status":1,"request":"OK_REPORT_RECORDED"};

        await sleep(500);
        return JSON.stringify(data);
    }

    async acceptedGoodRequest(): Promise<string> {
        const data = {"status":1,"request":"OK_REPORT_RECORDED"};

        await sleep(500);
        return JSON.stringify(data);
    }

}
