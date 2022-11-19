import { Injectable } from '@nestjs/common';

// app.post('/in.php', function (req, res) {
//     res.json({"status":1,"request":"2122988149"});
//     // res.json({"status":0,"request":"ERROR_EMPTY_ACTION"});
// })
// app.get('/res.php', function(req, res) {
//     res.json({"status":1,"request":"7bxmpg"});
//     //res.json({"status":0,"request":"CAPCHA_NOT_READY"});
// })

@Injectable()
export class RucaptchaService {
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
}
