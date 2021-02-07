export abstract class BaseException extends Error {
    abstract getMessage(): string;
}
