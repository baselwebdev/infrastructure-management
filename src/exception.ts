export abstract class Exception extends Error {
    stackName: string;
    message: string;
    stack: string;

    protected constructor(stackName: string, message: string, stack: string) {
        super();
        this.stackName = stackName;
        this.message = message;
        this.stack = stack;
    }

    public getMessage(): string {
        return `
Error: ${this.name} exception 
Stack name: ${this.stackName}
Error: ${this.message}
Message: ${this.stack}`;
    }
}

export class StackCreationException extends Exception {
    name = 'Failure to create stack';

    constructor(stackName: string, message: string, stack: string) {
        super(stackName, message, stack);
    }
}

export class StackDeletionException extends Exception {
    name = 'Failure to delete stack';

    constructor(stackName: string, message: string, stack: string) {
        super(stackName, message, stack);
    }
}

export class StackNotFoundException extends Exception {
    name = 'Failure to find the stack';

    constructor(stackName: string, message: string, stack: string) {
        super(stackName, message, stack);
    }
}
