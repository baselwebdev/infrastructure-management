import { BaseException } from './baseException';

export class StackDeletionException extends BaseException {
    name = 'Failure to delete stack';
    stackName: string;
    message: string;
    stack: string;

    constructor(stackName: string, message: string, stack: string) {
        super();
        this.stackName = stackName;
        this.message = message;
        this.stack = stack;
    }

    public getMessage(): string {
        return `
Error: ${this.name} Exception 
Stack name: ${this.stackName}
Error: ${this.message}
Message: ${this.stack}
`;
    }
}
