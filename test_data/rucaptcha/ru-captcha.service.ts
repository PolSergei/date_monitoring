import { Injectable } from '@nestjs/common';

// Файл для тестирования.
@Injectable()
export class RuCaptchaService {
    setTask(): string {
        const data = {"status":1, "request":"2122988149"};
        //const data = {"status":0,"request":"ERROR_EMPTY_ACTION"};
        return JSON.stringify(data);
    }

    getResult(): string {
        const data = {"status":1,"request":"7bxmpg"};
        // const data = {"status":0,"request":"CAPCHA_NOT_READY"};

        return JSON.stringify(data);
    }

    acceptedBadRequest(): string {
        const data = {"status":1,"request":"OK_REPORT_RECORDED"};

        return JSON.stringify(data);
    }

    acceptedGoodRequest(): string {
        const data = {"status":1,"request":"OK_REPORT_RECORDED"};

        return JSON.stringify(data);
    }

}
