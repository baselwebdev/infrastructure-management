# Infrastructure management

test

Manage your AWS cloudformation stack programmatically with Node.js

It uses CloudFormation to create the infrastructure stack.
 
You require IAM user with full CloudFormation permissions.

This repo used to be part of an internal monolithic software I developed for a personal project.

They have been open-sourced and split into three repos:

- [Repo retriever](https://github.com/baselwebdev/repo-retriever)

- [Software orchestration](https://github.com/baselwebdev/software-orchestration)

- [Infrastructure management](https://github.com/baselwebdev/infrastructure-management)

## TODO

- [ ] Add tests and get 100% test coverage
  
- [ ] Update AWS SDK to 3.0

- [ ] Add support for other cloud service provider such as GCP and Azure

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install infrastructure-management
$ npm run build
```

## Usage

Using the CLI

```sh
Options:
  --help                   Show help                                   [boolean]
  --version                Show version number                         [boolean]
  --stackName, -s          What action to perform on LifePlus infrastructure.
                                                             [string] [required]
  --action, -a             Run the delete action to delete the infrastructure.
                           Run create action to create the infrastructure. Run
                           redeploy action that deletes and the creates the
                           infrastructure.
                   [string] [required] [choices: "create", "delete", "redeploy"]
  --resourceDirectory, -d  Specify the resource directory. The resource
                           directory contains your config.json and
                           CloudFormationStack.json file     [string] [required]
```

The resource directory must contain your config.json and CloudFormationStack.json file.

```
root
│   config.json
│   CloudFormationStack.json
```

The config.json file:

```json
{
  "region": "",
  "accessKeyId": "",
  "secretAccessKey": ""
}
```

Resources in how to construct the CloudFormationStack.json file can be found from the official AWS resources.

Redeploy in action:

![Redeploy in action](https://baselwebdevgifs.s3.eu-west-2.amazonaws.com/infrastructure-management/infrastructure-management-running.gif)

## About

### Contributing

Pull requests are always welcome. 

For bugs and feature requests, [please create an issue](../../issues/new).

### Author

**Basel Ahmed**

* [github/baselwebdev](https://github.com/baselwebdev)
* [twitter/baselwebdev](https://twitter.com/baselwebdev)

### License

Copyright © 2020, [Basel Ahmed](https://github.com/baselwebdev).
Released under the [MIT License](LICENSE).
