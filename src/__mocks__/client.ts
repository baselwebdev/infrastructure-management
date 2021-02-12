import type { configFile } from '../config';

export default class Client {
    public static createCloudFormationConnection(config: configFile): CloudFormationClient {
        return new CloudFormationClient(config.region);
    }
}

interface DescribeStacksCommand {
    input: {
        StackName: string;
    };
}

class CloudFormationClient {
    region: string;

    constructor(region: string) {
        this.region = region;
    }

    public async send(param: DescribeStacksCommand): Promise<any> {
        return new Promise((resolve, reject) => {
            if (param.input.StackName === resource.name && this.region === resource.region) {
                resolve({ Stacks: [{ StackStatus: resource.status }] });
            } else if (this.region === resource.region) {
                reject({ name: 'ValidationError' });
            } else {
                reject({ message: 'Bad config' });
            }
        });
    }
}

// Our AWS resource state
const resource = {
    name: 'IEXIST',
    status: 'CREATE_COMPLETE',
    region: 'real-aws-region',
};
