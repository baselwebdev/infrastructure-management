import type { DescribeStackEventsInput } from '@aws-sdk/client-cloudformation/models/models_0';
import Client from './client';
import Config from './config';
import type { CloudFormationClient, CreateStackCommandInput } from '@aws-sdk/client-cloudformation';
import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import type { BaseError } from './exceptions/baseException';
import { StackCreationException } from './exceptions/stackCreationException';
import { StackNotFoundException } from './exceptions/stackNotFoundException';
import getCurrentLine from 'get-current-line';
import { StackStatusRetrievingException } from './exceptions/stackStatusRetrievingException';
import { ErrorCollection } from './exceptions/errorCollection';
import { CreateStackCommand } from '@aws-sdk/client-cloudformation';
import { readFileSync } from './fileManager';

export default class Infrastructure {
    protected cloudformationClient: CloudFormationClient;
    protected stackName: string;
    protected resourceDirectory: string;
    protected errorCollection: ErrorCollection;

    constructor(resourceDirectory: string, stackName: string) {
        const config = new Config(resourceDirectory);

        this.resourceDirectory = resourceDirectory;
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
            return await this.cloudformationClient
                .send(command)
                .then((response) => {
                    // Although we get a response from AWS possibly returns an empty stack array
                    // as defined in their TS definition.
                    if (response.Stacks === undefined) {
                        throw Error(
                            'Not able to find the given stack. Please check your configuration are correct.',
                        );
                    }

                    return response.Stacks[0].StackStatus as string;
                })
                .catch((error: Error) => {
                    if (error.name === 'ValidationError') {
                        return 'NOT_FOUND';
                    }
                    throw error;
                });
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

            // If status is not NOT_FOUND we are not able to create stack with same
            // name
            if (status !== 'NOT_FOUND') {
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

            const cloudFormationStack = JSON.stringify(
                readFileSync(this.resourceDirectory + '/CloudFormationStack.json'),
            );
            const params: CreateStackCommandInput = {
                StackName: this.stackName,
                TemplateBody: cloudFormationStack,
            };
            const command = new CreateStackCommand(params);
            const data = await this.cloudformationClient.send(command).catch((error: Error) => {
                throw error;
            });

            console.log(data);
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
