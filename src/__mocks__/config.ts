export default class Config {
    readonly region: string;
    readonly accessKeyId: string;
    readonly secretAccessKey: string;

    constructor(resourceDirectory: string) {
        this.region = 'real-aws-region';
        this.accessKeyId = 'key';
        this.secretAccessKey = 'id';

        if (resourceDirectory === '/directory/with/bad/config') {
            this.region = 'non-existing-region';
            this.accessKeyId = 'wrong-id';
            this.secretAccessKey = 'wrong-key';
        }
    }
}
