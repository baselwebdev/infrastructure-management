import type { CreateStackInput, DeleteStackInput } from 'aws-sdk/clients/cloudformation';
import type { AWSError } from 'aws-sdk/lib/error';
import Authenticator from './authenticator';
import CloudFormation from 'aws-sdk/clients/cloudformation';
import { readFileSync } from './fileManager';

interface WaitForParams {
    StackName: string;
}

export default class Infrastructure {
    protected Cloud: CloudFormation;
    protected resourceDirectory: string;
    protected stackName: string;

    constructor(resourceDirectory: string, stackName: string) {
        this.resourceDirectory = resourceDirectory;
        this.stackName = stackName;
        Authenticator.authenticateAws(resourceDirectory);
        this.Cloud = new CloudFormation();
    }

    protected createStackInput(): CreateStackInput {
        const cloudFormationStack = readFileSync(
            this.resourceDirectory + '/CloudFormationStack.json',
        );

        return {
            StackName: this.stackName,
            TemplateBody: JSON.stringify(cloudFormationStack),
            OnFailure: 'ROLLBACK',
        };
    }

    protected deleteStackInput(): DeleteStackInput {
        return {
            StackName: this.stackName,
        };
    }

    protected waitForStackExistsInput(): WaitForParams {
        return {
            StackName: this.stackName,
        };
    }

    public create(): void {
        const cloudFormationParameters = this.createStackInput();
        const cloudFormationRequest = this.Cloud.createStack(cloudFormationParameters);

        cloudFormationRequest.on('complete', function (response) {
            if (response.httpResponse.statusCode === 200) {
                console.log('Creating infrastructure');
            } else {
                console.log('Something went wrong');
                console.log(response);
            }
        });
        cloudFormationRequest.send();
    }

    public delete(): void {
        const cloudFormationParameters = this.deleteStackInput();
        const cloudFormationRequest = this.Cloud.deleteStack(cloudFormationParameters);

        cloudFormationRequest.on('complete', function (response) {
            if (response.httpResponse.statusCode === 200) {
                console.log('Deletion started');
            } else {
                console.log('Something went wrong');
                console.log(response);
            }
        });
        cloudFormationRequest.send();
    }

    public redeploy(): void {
        const cloudFormationStackExistParameters = this.waitForStackExistsInput();

        this.Cloud.waitFor(
            'stackExists',
            cloudFormationStackExistParameters,
            (err: AWSError | null, data: CloudFormation.Types.DescribeStacksOutput) => {
                if (err) {
                    console.log(err);
                } else {
                    if (data.Stacks?.length === 1) {
                        if (data.Stacks[0].StackStatus === 'CREATE_COMPLETE') {
                            console.log('Existing infrastructure found');
                            this.delete();
                            this.Cloud.waitFor(
                                'stackDeleteComplete',
                                cloudFormationStackExistParameters,
                                (err: AWSError | null) => {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        console.log('Deletion completed');
                                        this.create();
                                        setTimeout(() => {
                                            this.Cloud.waitFor(
                                                'stackCreateComplete',
                                                cloudFormationStackExistParameters,
                                                (
                                                    err: AWSError | null,
                                                    data: CloudFormation.Types.DescribeStacksOutput,
                                                ) => {
                                                    if (err) {
                                                        console.log(err);
                                                    } else {
                                                        if (data.Stacks?.length === 1) {
                                                            console.log(
                                                                'Finished creating ' +
                                                                    this.stackName,
                                                            );
                                                        }
                                                    }
                                                },
                                            );
                                        }, 5000);
                                    }
                                },
                            );
                        }
                    }
                }
            },
        );
    }
}
