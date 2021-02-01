import type { BaseError } from './baseException';

export class StackNotFoundException implements BaseError {
    name = 'Stack Not Found';
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
