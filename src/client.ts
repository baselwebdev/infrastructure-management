import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import type { CloudFormationClientConfig } from '@aws-sdk/client-cloudformation';
import type { configFile } from './config';

export default class Client {
    public static createCloudFormationConnection(config: configFile): CloudFormationClient {
        const param: CloudFormationClientConfig = {
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            region: config.region,
        };

        return new CloudFormationClient(param);
    }
}
