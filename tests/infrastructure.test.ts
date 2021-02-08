import Infrastructure from '../src/infrastructure';

jest.mock('../src/config');
jest.mock('../src/client');

test('getStackStatus handles non existing stack correctly', async () => {
    const infra = new Infrastructure('directory', 'testStackName');
    const result = await infra.getStackStatus();

    expect(result).toBe('NOT_FOUND');
});

test('getStackStatus returns correctly for existing stack', async () => {
    const infra = new Infrastructure('directory', 'IEXIST');
    const result = await infra.getStackStatus();

    expect(result).toBe('CREATE_COMPLETE');
});
