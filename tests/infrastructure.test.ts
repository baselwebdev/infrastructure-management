import Infrastructure from '../src/infrastructure';
import { StackNotFoundException } from '../src/exception';

jest.mock('../src/config');
jest.mock('../src/client');

afterEach(() => {
    jest.clearAllMocks();
});

test('getStackStatus handles non existing stack correctly', async () => {
    const infra = new Infrastructure('/some/directory/', 'testStackName');
    const result = await infra.getStackStatus();

    expect(result).toBe('NOT_FOUND');
});

test('getStackStatus returns correctly for existing stack', async () => {
    const infra = new Infrastructure('/some/directory/', 'IEXIST');
    const result = await infra.getStackStatus();

    expect(result).toBe('CREATE_COMPLETE');
});

test('getStackStatus throws exception when wrong config is provided', () => {
    const infra = new Infrastructure('/directory/with/bad/config', 'BADSTACK');

    void expect(async () => {
        await infra.getStackStatus();
    }).rejects.toThrow(StackNotFoundException);
});
