import Infrastructure from '../src/infrastructure';
import {
    StackCreationException,
    StackDeletionException,
    StackNotFoundException,
} from '../src/exception';

jest.mock('../src/config');
jest.mock('../src/client');

describe('getStackStatus', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('handles non existing stack correctly', async () => {
        const cloudInfrastructure = new Infrastructure('/some/directory/', 'testStackName');
        const result = await cloudInfrastructure.getStackStatus();

        expect(result).toBe('NOT_FOUND');
    });

    it('returns correctly for existing stack', async () => {
        const cloudInfrastructure = new Infrastructure('/some/directory/', 'IEXIST');
        const result = await cloudInfrastructure.getStackStatus();

        expect(result).toBe('CREATE_COMPLETE');
    });

    it('throws exception when wrong config is provided', () => {
        const cloudInfrastructure = new Infrastructure('/directory/with/bad/config', 'BADSTACK');

        void expect(async () => {
            await cloudInfrastructure.getStackStatus();
        }).rejects.toThrow(StackNotFoundException);
    });
});

describe('createStack', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws exception on failure to create stack', () => {
        const cloudInfrastructure = new Infrastructure('/some/directory/', 'IEXIST');

        void expect(async () => {
            await cloudInfrastructure.createStack();
        }).rejects.toThrow(StackCreationException);
    });
});

describe('deleteStack', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('throws exception on failure to delete stack', () => {
        const cloudInfrastructure = new Infrastructure('/some/directory/', 'IEXIST');

        void expect(async () => {
            await cloudInfrastructure.deleteStack();
        }).rejects.toThrow(StackDeletionException);
    });
});
