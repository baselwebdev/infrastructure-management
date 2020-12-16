import AWS from 'aws-sdk';
import Config from './config';

export default class Authenticator {
    public static authenticateAws(resourceDirectory: string): void {
        const config = new Config(resourceDirectory);
        const credentials = {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
        };

        AWS.config.update({ region: config.region, credentials: credentials });
    }
}
