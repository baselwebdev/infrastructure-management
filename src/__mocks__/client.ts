export default class Client {
    public static createCloudFormationConnection(): CloudFormationClient {
        return new CloudFormationClient();
    }
}

interface DescribeStacksCommand {
    input: {
        StackName: string;
    };
}

class CloudFormationClient {
    public async send(stackName: DescribeStacksCommand): Promise<any> {
        return new Promise((resolve, reject) => {
            stackName.input.StackName === 'IEXIST'
                ? resolve({ Stacks: [{ StackStatus: 'CREATE_COMPLETE' }] })
                : reject({ name: 'ValidationError' });
        });
    }
}
