import {Controller, Get} from '@nestjs/common';
import {EmbassyService} from "./embassy.service";

@Controller('embassy')
export class EmbassyController {
    constructor(readonly embassyService: EmbassyService) {}

    @Get('rktermin/extern/appointment_showMonth.do')
    pageWithCaptcha(): string {
        return this.embassyService.pageWithCaptcha();
    }
}