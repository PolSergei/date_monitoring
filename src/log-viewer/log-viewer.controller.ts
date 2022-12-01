import {Controller, Get} from '@nestjs/common';
import {LogViewerService} from "./log-viewer.service";

@Controller()
export class LogViewerController {
    constructor(readonly logViewerService: LogViewerService) {}

    @Get()
    listFiles(): string {
        return this.logViewerService.listFiles();
    }
}
