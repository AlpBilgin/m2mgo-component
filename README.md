# m2mgo-component [![Build Status][travis-image]][travis-url]
> elastic.io integration component for M2MGO platform

# m2mgo-component
M2MGO Component component for the [elastic.io platform](http://www.elastic.io &#34;elastic.io platform&#34;)

## Before you Begin

Before you can deploy any code into elastic.io **you must be a registered elastic.io platform user**. Please see our home page at [http://www.elastic.io](http://www.elastic.io) to learn how.

## Getting Started

This is a Node.js based project and was initially developed using Node v.8.9.0 and NPM 5.5.1 (as of 13.11.2017).

Installing dependencies: Use a terminal to navigate to the project folder (where package.json is) and run command
 ``` Shell 
 npm install
 ``` 
to download dependencies. There should be no red in terminal.

### Authentication

You need to configure your email and password to authenticate the M2MGO component.

Test Credentials: Creating a testconfig.ts file in project folder is the suggested way of declaring M2MGO credentials for testing. It should look like the following:
```TypeScript
export const TestConfig = { Email: "<email here>", Password: "<password here>" };
```

### Testing

WARNING: Testing will insert dummy information to the first table available to your account. Please do not run tests of your account is on a prodution environment.

Use a terminal to navigate to the project folder (where package.json is) and run command 
 ``` Shell 
 npm test
 ``` 
If login info was properly defined it should insert one line of dummy information to M2MGO.

### Push

You can insert incoming data into an entity with push action. Component will detect the available prototype entities and make them available for selection.

## Known issues

* Testing will feature a mocked mode once M2MGO API is better understood.

## TODOs
 * Write more actions / triggers.
 * Improve error handling.

## License

Apache-2.0 © [elastic.io GmbH](https://www.elastic.io)

[travis-image]: https://travis-ci.org/AlpBilgin/m2mgo-component.svg?branch=master
[travis-url]: https://travis-ci.org/AlpBilgin/m2mgo-component
