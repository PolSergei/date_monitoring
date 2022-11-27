import {Module} from '@nestjs/common'
import {EmbassyController} from './embassy/embassy.controller';
import {EmbassyService} from './embassy/embassy.service';
import {RucaptchaController} from './rucaptcha/rucaptcha.controller';
import {RucaptchaService} from './rucaptcha/rucaptcha.service';

@Module({
    imports: [],
    controllers: [EmbassyController, RucaptchaController],
    providers: [EmbassyService, RucaptchaService],
})
export class TestBackModule {
}
