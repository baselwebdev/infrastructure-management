import type { DescribeStackEventsInput } from '@aws-sdk/client-cloudformation/models/models_0';
import Client from './client';
import Config from './config';
import type { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import type { BaseError } from './exceptions/baseException';
import { StackCreationException } from './exceptions/stackCreationException';
import { StackNotFoundException } from './exceptions/stackNotFoundException';
import getCurrentLine from 'get-current-line';
import { StackStatusRetrievingException } from './exceptions/stackStatusRetrievingException';
import { ErrorCollection } from './exceptions/errorCollection';

export default class Infrastructure {
    protected cloudformationClient: CloudFormationClient;
    protected stackName: string;
    protected errorCollection: ErrorCollection;

    constructor(resourceDirectory: string, stackName: string) {
        const config = new Config(resourceDirectory);

        this.cloudformationClient = Client.createCloudFormationConnection(config);
        this.stackName = stackName;
        this.errorCollection = new ErrorCollection();
    }

    public getErrors(): BaseError[] {
        return this.errorCollection.get();
    }

    protected async getStackStatus(): Promise<string> {
        const params: DescribeStackEventsInput = {
            StackName: this.stackName,
        };
        const command = new DescribeStacksCommand(params);

        try {
            const data = await this.cloudformationClient.send(command).catch((error: Error) => {
                if (error.name === 'ValidationError') {
                    const stackNotFound = new StackNotFoundException(
                        this.stackName,
                        'Stack name was not found in your given AWS account',
                        `Error thrown in file ${getCurrentLine().file} on line ${
                            getCurrentLine().line
                        }`,
                    );

                    this.errorCollection.add(stackNotFound);

                    throw stackNotFound;
                }
                throw error;
            });

            // Check stack was found
            if (data.Stacks === undefined) {
                throw Error(
                    'Not able to find the given stack. Please check your configuration are correct.',
                );
            }

            return data.Stacks[0].StackStatus as string;
        } catch (error) {
            if (error instanceof StackNotFoundException) {
                const stackStatusRetrievingFailure = new StackStatusRetrievingException(
                    this.stackName,
                    'Failure to retrieve the status of the given stack.',
                    `Error thrown in file ${getCurrentLine().file} on line ${
                        getCurrentLine().line
                    }`,
                );

                this.errorCollection.add(stackStatusRetrievingFailure);

                throw stackStatusRetrievingFailure;
            }
            throw Error(error);
        }
    }

    public async createStack(): Promise<void> {
        try {
            const status = await this.getStackStatus();

            if (status === 'CREATE_COMPLETE') {
                const stackCreationFailure = new StackCreationException(
                    this.stackName,
                    'Failure to create a stack as it already exist in your AWS account.',
                    `Error thrown in file ${getCurrentLine().file} on line ${
                        getCurrentLine().line
                    }`,
                );

                this.errorCollection.add(stackCreationFailure);

                throw stackCreationFailure;
            }

            console.log(status);
        } catch (error) {
            throw Error(error);
        }
    }

    // check if the stack exists if not
    // create for the given stack

    // if stack exists then
    // delete the given stack

    // if stack exists then
    // redeploy stack by checking exists
}
