import {Module} from '@nestjs/common'
import {EmbassyController} from './embassy/embassy.controller';
import {EmbassyService} from './embassy/embassy.service';
import {RuCaptchaController} from './rucaptcha/ru-captcha.controller';
import {RuCaptchaService} from './rucaptcha/ru-captcha.service';
import { LogViewerController } from '../src/log-viewer/log-viewer.controller';
import { LogViewerService } from '../src/log-viewer/log-viewer.service';

@Module({
    imports: [],
    controllers: [EmbassyController, RuCaptchaController, LogViewerController],
    providers: [EmbassyService, RuCaptchaService, LogViewerService],
})
export class TestBackModule {
}
