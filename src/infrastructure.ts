import type {
    CloudFormationClient,
    CreateStackCommandInput,
    DeleteStackCommandInput,
} from '@aws-sdk/client-cloudformation';
import { CreateStackCommand, DeleteStackCommand } from '@aws-sdk/client-cloudformation';
import {
    StackCreationException,
    StackDeletionException,
    StackNotFoundException,
} from './exception';
import Client from './client';
import Config from './config';
import type { DescribeStackEventsInput } from '@aws-sdk/client-cloudformation';
import { DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import getCurrentLine from 'get-current-line';
import { readFileSync } from './fileManager';

export default class Infrastructure {
    protected cloudformationClient: CloudFormationClient;
    protected stackName: string;
    protected resourceDirectory: string;

    constructor(resourceDirectory: string, stackName: string) {
        const config = new Config(resourceDirectory);

        this.resourceDirectory = resourceDirectory;
        this.cloudformationClient = Client.createCloudFormationConnection(config);
        this.stackName = stackName;
    }

    public async getStackStatus(): Promise<string> {
        const params: DescribeStackEventsInput = {
            StackName: this.stackName,
        };
        const command = new DescribeStacksCommand(params);

        return await this.cloudformationClient
            .send(command)
            .then((response) => {
                // It is possible to receive a response with empty stacks,
                // which we assume is due no Stack being found in AWS.
                if (response.Stacks === undefined) {
                    return 'NOT_FOUND';
                }

                return response.Stacks[0].StackStatus as string;
            })
            .catch((error: Error) => {
                // If we receive error of ValidationError,
                // we assume is due no Stack being found in AWS.
                if (error.name === 'ValidationError') {
                    return 'NOT_FOUND';
                }

                throw new StackNotFoundException(
                    this.stackName,
                    'Failure to find the stack.',
                    `Error thrown in file ${getCurrentLine().file} on line ${
                        getCurrentLine().line
                    }`,
                );
            });
    }

    public async createStack(): Promise<void> {
        const status = await this.getStackStatus();

        if (status === 'CREATE_IN_PROGRESS') {
            const validate = (result: string): boolean => result !== 'CREATE_COMPLETE';

            await this.poll(validate);

            return;
        }

        // If status is not NOT_FOUND we are not able to create stack with same
        // name
        if (status !== 'NOT_FOUND') {
            throw new StackCreationException(
                this.stackName,
                'Failure to create a stack as it already exist in your AWS account.',
                `Error thrown in file ${getCurrentLine().file} on line ${getCurrentLine().line}`,
            );
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
            throw new StackCreationException(
                this.stackName,
                `Failure to create a stack. AWS: ${error.message}`,
                `Error thrown in file ${getCurrentLine().file} on line ${getCurrentLine().line}`,
            );
        });
        const validate = (result: string): boolean => result !== 'CREATE_COMPLETE';

        await this.poll(validate);
    }

    public async deleteStack(): Promise<void> {
        const status = await this.getStackStatus();

        // Cannot delete a stack that cannot be found in AWS
        if (status === 'NOT_FOUND') {
            throw new StackDeletionException(
                this.stackName,
                'Failure to delete a stack as it does not exist in your AWS account.',
                `Error thrown in file ${getCurrentLine().file} on line ${getCurrentLine().line}`,
            );
        }

        const params: DeleteStackCommandInput = {
            StackName: this.stackName,
        };
        const command = new DeleteStackCommand(params);

        await this.cloudformationClient.send(command).catch((error: Error) => {
            throw new StackDeletionException(
                this.stackName,
                `Failure to delete the stack. AWS: ${error.message}`,
                `Error thrown in file ${getCurrentLine().file} on line ${getCurrentLine().line}`,
            );
        });

        const validate = (result: string): boolean => result !== 'NOT_FOUND';

        await this.poll(validate);
    }

    /*
     * Poll AWS to check the stack status.
     * */
    private async poll(fnCondition: { (result: string): boolean }): Promise<string> {
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
    private async wait(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, 3000);
        });
    }
}
