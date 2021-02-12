import Chalk from 'chalk';
import { readFileSync } from './fileManager';

export interface configFile {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
}

export default class Config {
    readonly region: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;

    constructor(resourceDirectory: string) {
        try {
            const config = readFileSync(resourceDirectory + '/config.json') as configFile;

            this.region = config.region;
            this.accessKeyId = config.accessKeyId;
            this.secretAccessKey = config.secretAccessKey;
        } catch (e) {
            throw Error(
                Chalk.red(
                    'Failed finding the config file at: ' + resourceDirectory + 'config.json',
                ),
            );
        }
    }
}
