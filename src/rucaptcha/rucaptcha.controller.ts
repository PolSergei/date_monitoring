import {Controller, Get, Post} from '@nestjs/common';
import {RucaptchaService} from "./rucaptcha.service";

@Controller('rucaptcha')
export class RucaptchaController {
    constructor(private readonly rucaptchaService: RucaptchaService) {}

    @Get('res.php')
    getResult(): string {
        return this.rucaptchaService.getResult();
    }

    @Post('in.php')
    setTask(): string {
        return this.rucaptchaService.setTask();
    }
}
