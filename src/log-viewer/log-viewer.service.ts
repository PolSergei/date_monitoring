import { Injectable } from '@nestjs/common';
import {readdirSync} from "fs";

@Injectable()
export class LogViewerService {
    listFiles(): string {
        let listFiles = new Array<string>;
        readdirSync(process.cwd() ).forEach(file => {
            listFiles.push(file);
        });
        return JSON.stringify(listFiles);
    }
}
