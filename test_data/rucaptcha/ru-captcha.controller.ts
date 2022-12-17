import {Controller, Get, Post} from '@nestjs/common';
import {RuCaptchaService} from "./ru-captcha.service";

@Controller('rucaptcha')
export class RuCaptchaController {
    constructor(private readonly rucaptchaService: RuCaptchaService) {}

    @Get('res.php')
    getResult(): string {
        return this.rucaptchaService.getResult();
    }

    @Post('in.php')
    setTask(): string {
        return this.rucaptchaService.setTask();
    }
}
