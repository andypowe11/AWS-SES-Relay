# SES-Relay

A Lambda function to use with SES that will forward all messages sent to any email address in a domain (i.e. anything@mydomain.com) on to a single email address - a kind of email catch-all.

Useful when you want to handle messages being sent to lots of emails at a particular address but where you can't easily enumerate them all in advance.

## Deployment

Configure SES and validate the domain that you want to catch all email for and the email address that you want to relay all the messages to.

Configure an S3 bucket to hold the incoming messages.

Deploy this Lambda function (see below).

Configure an SES rule set with three steps. 1) S3 - save the incoming message to the S3 bucket. 2) Lambda - call this Lambda function. 3) Stop Rule Set.

## Deploying the Lambda function

Build the function as follows:

Create a directory to work in.

Put copies of index.js and package.json in that folder.

Run 'npm install'.

Run 'zip -r SES-Relay.zip'

Crefate a Lamda function and upload the Zip file. Note that the Lambda function will need read-obly access to S3 and write access to SES.

## Limitations

This Lambda function doesn't handle attachments currently. They will be stripped from the relayed message.

Incoming messages are not deleted from the S3 bucket.
