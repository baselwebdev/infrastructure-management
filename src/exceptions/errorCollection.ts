import type { BaseError } from './baseException';

export class ErrorCollection {
    private readonly collection: BaseError[];

    constructor() {
        this.collection = [];
    }

    add(error: BaseError): void {
        this.collection.push(error);
    }

    get(): BaseError[] {
        return this.collection;
    }
}
