import {Module} from '@nestjs/common'
import {EmbassyController} from './embassy/embassy.controller';
import {EmbassyService} from './embassy/embassy.service';
import {RucaptchaController} from './rucaptcha/rucaptcha.controller';
import {RucaptchaService} from './rucaptcha/rucaptcha.service';
import { LogViewerController } from './log-viewer/log-viewer.controller';
import { LogViewerService } from './log-viewer/log-viewer.service';

@Module({
    imports: [],
    controllers: [EmbassyController, RucaptchaController, LogViewerController],
    providers: [EmbassyService, RucaptchaService, LogViewerService],
})
export class TestBackModule {
}
