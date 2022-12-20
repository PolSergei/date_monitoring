import {Controller, Get, Post, Query} from '@nestjs/common';
import {RuCaptchaService} from "./ru-captcha.service";

@Controller('rucaptcha')
export class RuCaptchaController {
    constructor(private readonly rucaptchaService: RuCaptchaService) {
    }

    @Get('res.php?')
    getResult(@Query('action') action): string {
        switch (action) {
            case 'get': {
                return this.rucaptchaService.getResult();
            }
            case 'reportbad': {
                return this.rucaptchaService.acceptedBadRequest();
            }
            case 'reportgood': {
                return this.rucaptchaService.acceptedGoodRequest();
            }
            default: {
                return this.rucaptchaService.getResult();
            }
        }
    }

    @Post('in.php')
    setTask(): string {
        return this.rucaptchaService.setTask();
    }
}
