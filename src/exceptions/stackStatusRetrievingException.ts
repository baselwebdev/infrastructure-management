import type { BaseError } from './baseException';

export class StackStatusRetrievingException implements BaseError {
    name = 'Stack Status Not Found';
    stackName: string;
    message: string;
    stack: string;

    constructor(stackName: string, message: string, stack: string) {
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
