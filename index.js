var AWS = require('aws-sdk');
var s3 = new AWS.S3();
var simpleParser = require('mailparser').simpleParser;

// S3 bucket where incoming email is stored
var bucketname = process.env.BUCKETNAME;
// Email address that we are going to forward eveything to
var relaytoaddress = process.env.RELAYTOADDRESS;
 
exports.handler = function(event, context, callback) {
    console.log('Process email');
 
    var sesNotification = event.Records[0].ses;
    console.log("SES Notification:\n", JSON.stringify(sesNotification, null, 2));
    
    // Retrieve the email from your bucket
    s3.getObject({
            Bucket: bucketname,
            Key: sesNotification.mail.messageId
        }, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                callback(err);
            } else {
                console.log("Raw email:\n" + data.Body);
                
		        // Parse the message body
		        //var parsed = await simpleParser(data.Body);
		        simpleParser(data.Body, (err, parsed) => {
                    if (err) {
                        console.log(err, err.stack);
                        callback(err);
                    } else {
                        console.log("date:", parsed.date);
                        console.log("subject:", parsed.subject);
                        console.log("body:", parsed.text);
                        console.log("html:", parsed.html);
                        console.log("from:", parsed.from.text);
                        console.log("attachments:", parsed.attachments);
                        //callback(null, null);
		        
                        // Create sendEmail params 
                        var params = {
                            Destination: {
                                CcAddresses: [
                                ],
                                ToAddresses: [
                                    relaytoaddress
                                ]
                            },
                            Message: {
                                Body: {
                                    Html: {
                                        Charset: "UTF-8",
                                        Data: parsed.html
                                    },
                                    Text: {
                                        Charset: "UTF-8",
                                        Data: parsed.text
                                    }
                                },
                                Subject: {
                                    Charset: 'UTF-8',
                                    Data: sesNotification.mail.commonHeaders.subject
                                }
                            },
                            Source: sesNotification.mail.destination.toString(),
                            ReplyToAddresses: [
                                sesNotification.mail.destination.toString()
                            ],
                        };
                        // Create the promise and SES service object
                        var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
                        console.log("About to send email");
                        
                        // Handle promise's fulfilled/rejected states
                        sendPromise.then(
                            function(data) {
                                console.log("Message sent:", data.MessageId);
                                callback(null, null);
                            }).catch(
                                function(err) {
                                    console.error(err, err.stack);
                                    callback(err);
                                });
                    }
                });
            }
        });
};
