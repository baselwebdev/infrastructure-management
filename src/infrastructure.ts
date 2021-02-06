import type {
    CloudFormationClient,
    CreateStackCommandInput,
    DeleteStackCommandInput,
} from '@aws-sdk/client-cloudformation';
import { CreateStackCommand, DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import type { BaseError } from './exceptions/baseException';
import Client from './client';
import Config from './config';
import type { DescribeStackEventsInput } from '@aws-sdk/client-cloudformation';
import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { ErrorCollection } from './exceptions/errorCollection';
import { StackCreationException } from './exceptions/stackCreationException';
import { StackNotFoundException } from './exceptions/stackNotFoundException';
import getCurrentLine from 'get-current-line';
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

    public async getStackStatus(): Promise<string> {
        const params: DescribeStackEventsInput = {
            StackName: this.stackName,
        };
        const command = new DescribeStacksCommand(params);

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
    }

    /*
     * Poll AWS to check the stack status.
     * */
    private async poll(fnCondition: { (result: string): boolean }) {
        let result = await this.getStackStatus();

        while (fnCondition(result)) {
            await this.wait();
            console.log(`Stack state: ${result}`);
            result = await this.getStackStatus();
        }

        return result;
    }

    /*
     * Make the program wait. Used for API polling to find state status.
     * */
    private async wait(ms = 3000) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
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

            await this.cloudformationClient.send(command).catch((error: Error) => {
                throw error;
            });
            const validate = (result: string): boolean => result !== 'CREATE_COMPLETE';

            await this.poll(validate);
        } catch (error) {
            throw Error(error);
        }
    }

    public async deleteStack(): Promise<void> {
        const status = await this.getStackStatus();

        try {
            // Cannot delete a stack that cannot be found in AWS
            if (status === 'NOT_FOUND') {
                const stackCreationFailure = new StackNotFoundException(
                    this.stackName,
                    'Failure to find the stack to delete.',
                    `Error thrown in file ${getCurrentLine().file} on line ${
                        getCurrentLine().line
                    }`,
                );

                this.errorCollection.add(stackCreationFailure);

                throw stackCreationFailure;
            }

            const params: DeleteStackCommandInput = {
                StackName: this.stackName,
            };
            const command = new DeleteStackCommand(params);

            await this.cloudformationClient.send(command).catch((error: Error) => {
                throw error;
            });

            const validate = (result: string): boolean => result !== 'NOT_FOUND';

            await this.poll(validate);
        } catch (error) {
            throw Error(error);
        }
    }
}
