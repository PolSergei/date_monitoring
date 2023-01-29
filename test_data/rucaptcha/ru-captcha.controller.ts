import {Controller, Get, Post, Query} from '@nestjs/common';
import {RuCaptchaService} from "./ru-captcha.service";

@Controller('rucaptcha')
export class RuCaptchaController {
    constructor(private readonly rucaptchaService: RuCaptchaService) {
    }

    @Get('res.php?')
    async getResult(@Query('action') action): Promise<string> {
        switch (action) {
            case 'get': {
                return await this.rucaptchaService.getResult();
            }
            case 'reportbad': {
                return await this.rucaptchaService.acceptedBadRequest();
            }
            case 'reportgood': {
                return await this.rucaptchaService.acceptedGoodRequest();
            }
            default: {
                return await this.rucaptchaService.getResult();
            }
        }
    }

    @Post('in.php')
    async setTask(): Promise<string> {
        return await this.rucaptchaService.setTask();
    }
}
