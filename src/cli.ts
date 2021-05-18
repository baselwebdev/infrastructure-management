import Chalk from 'chalk';
import { Exception } from './exception';
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

const cloudInfrastructure = new Infrastructure(
    Yargs.argv.resourceDirectory as string,
    Yargs.argv.stackName as string,
);

switch (Yargs.argv.action) {
    case 'create':
        console.log('Attempt creating the stack');
        void cloudInfrastructure
            .createStack()
            .then(() => {
                console.log(
                    Chalk.green(`Finished creating the stack: ${Yargs.argv.stackName as string}`),
                );
            })
            .catch((error) => {
                if (error instanceof Exception) {
                    console.log(Chalk.red(error.getMessage()));
                }
            });
        break;
    case 'delete':
        console.log('Existing stack stack found');
        console.log('Attempt deleting the stack');
        void cloudInfrastructure
            .deleteStack()
            .then(() => {
                console.log(
                    Chalk.green(`Finished deleting the stack: ${Yargs.argv.stackName as string}`),
                );
            })
            .catch((error) => {
                if (error instanceof Exception) {
                    console.log(Chalk.red(error.getMessage()));
                }
            });
        break;
    case 'redeploy':
        void (async () => {
            try {
                const status = await cloudInfrastructure.getStackStatus();

                if (status === 'NOT_FOUND' || status === 'CREATE_IN_PROGRESS') {
                    console.log('Attempt creating the stack');
                    await cloudInfrastructure.createStack().then(() => {
                        console.log(
                            Chalk.green(
                                `Finished creating the stack: ${Yargs.argv.stackName as string}`,
                            ),
                        );
                    });
                }

                if (status === 'CREATE_COMPLETE' || status === 'DELETE_IN_PROGRESS') {
                    console.log('Existing stack stack found');
                    console.log('Attempt deleting the stack');
                    await cloudInfrastructure.deleteStack().then(() => {
                        console.log(Chalk.green('Finished deleting the stack'));
                        console.log('Attempt creating the stack');
                    });
                    await cloudInfrastructure.createStack().then(() => {
                        console.log(
                            Chalk.green(
                                `Finished creating the stack: ${Yargs.argv.stackName as string}`,
                            ),
                        );
                    });
                }
            } catch (error) {
                console.log('Redeploy command failure');

                if (error instanceof Exception) {
                    console.log(Chalk.red(error.getMessage()));
                }
                process.exitCode = 1;
            }
        })();
        break;
    default:
        console.log(Chalk.red('We could not find the infrastructure action.'));
        console.log(
            Chalk.red('Please run the help command to find all the available action you can run.'),
        );
}
