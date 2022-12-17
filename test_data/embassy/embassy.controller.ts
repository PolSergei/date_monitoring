import {Controller, Get, Post, Res} from '@nestjs/common';
import {EmbassyService} from "./embassy.service";
import {Response} from "express";

// todo Переименовать этот и связанные с ним файлы, что бы было понятно что это тестовые данные
@Controller('embassy')
export class EmbassyController {
    constructor(readonly embassyService: EmbassyService) {
    }

    @Get('rktermin/extern/appointment_showMonth.do')
    pageWithCaptcha(@Res({passthrough: true}) response: Response): string {
        response.cookie('JSESSIONID', 'E505F149FA6D5CC624C518E042A632C0', {'path': '/rktermin/'});
        response.cookie('KEKS', 'TERMIN327');
        return this.embassyService.pageWithCaptcha();
    }

    @Post('/rktermin/extern/appointment_showMonth.do')
    datesPage(): string {
        // return this.embassyService.datesPage();
        // todo пока тестовый вариант
        return this.embassyService.wrongCaptcha();
    }
}
