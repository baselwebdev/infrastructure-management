import { BaseException } from './exceptions/baseException';
import Chalk from 'chalk';
import Infrastructure from './infrastructure';
import Yargs from 'yargs';

type Action = 'create' | 'delete' | 'redeploy';
const actions: readonly Action[] = ['create', 'delete', 'redeploy'];

Yargs.options({
    stackName: {
        demandOption: true,
        alias: 's',
        type: 'string',
        description: 'What action to perform on LifePlus infrastructure.',
    },
    action: {
        demandOption:
            'Please select an action. You can find the available action by running the help command.',
        alias: 'a',
        type: 'string',
        choices: actions,
        description:
            'Run the delete action to delete the infrastructure. ' +
            'Run create action to create the infrastructure. ' +
            'Run redeploy action that deletes and the creates the infrastructure.',
    },
    resourceDirectory: {
        demandOption: true,
        alias: 'd',
        type: 'string',
        description:
            'Specify the resource directory. ' +
            'The resource directory contains your config.json and CloudFormationStack.json file',
    },
}).strict().argv;

const cloud = new Infrastructure(
    Yargs.argv.resourceDirectory as string,
    Yargs.argv.stackName as string,
);

switch (Yargs.argv.action) {
    case 'create':
        void cloud.createStack().catch((error) => {
            console.log('Create command failure');
            if (error instanceof BaseException) {
                console.log(error.getMessage());
            }
        });
        console.log(`Finished creating the stack: ${Yargs.argv.stackName as string}`);
        break;
    case 'delete':
        void cloud
            .deleteStack()
            .then(() => {
                console.log(`Finished deleting the stack: ${Yargs.argv.stackName as string}`);
            })
            .catch((error) => {
                console.log('Delete command failure');
                if (error instanceof BaseException) {
                    console.log(error.getMessage());
                }
            });
        break;
    case 'redeploy':
        void (async () => {
            const status = await cloud.getStackStatus();

            try {
                if (status === 'NOT_FOUND') {
                    console.log('Creating the stack');
                    await cloud.createStack().then(() => {
                        console.log(
                            `Finished creating the stack: ${Yargs.argv.stackName as string}`,
                        );
                    });
                }

                if (status === 'CREATE_COMPLETE') {
                    console.log('Existing stack stack found');
                    console.log('Deleting the stack');
                    await cloud.deleteStack().then(() => {
                        console.log('Finished deleting the stack');
                        console.log('Creating the stack');
                    });
                    await cloud.createStack().then(() => {
                        console.log(
                            `Finished creating the stack: ${Yargs.argv.stackName as string}`,
                        );
                    });
                }
            } catch (error) {
                console.log('Redeploy command failure');
                if (error instanceof BaseException) {
                    console.log(error.getMessage());
                }
            }
        })();
        break;
    default:
        console.log(Chalk.red('We could not find the infrastructure action.'));
        console.log(
            Chalk.red('Please run the help command to find all the available action you can run.'),
        );
}
