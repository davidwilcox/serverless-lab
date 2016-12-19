'use strict';

var AWS = require('aws-sdk');
var sns = new AWS.SNS();


function guid() {
    function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}

var bucket_name = 'my-text-messages10-dawilcox';
var s3bucket = new AWS.S3({params: {Bucket: bucket_name}});

module.exports.textmessagecreate = (event, context, callback) => {
    if ( !event || !event.queryStringParameters || !event.queryStringParameters.textToUpload ) {
	callback({msg:"Malformed Request:",
		  request:event});
    }
    s3bucket.upload({
	Key: guid() + ".txt",
	Body: event.queryStringParameters.textToUpload},
		    function(err, data) {
			if ( err ) {
			    return callback(err);
			} else {
			    sns.publish({
				Message: guid() + ".txt",
				TopicArn: "arn:aws:sns:us-east-1:272016194640:dispatch-events-dawilcox"
			    }, function(err, data) {
				if ( err ) {
				    return callback(err);
				}
				return callback(null,{
				    statusCode: 200,
				    body: JSON.stringify(data)
				});
			    });
			}
		    });
};



var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.textmessageprocess = (event, context, callback) => {
    /*
    console.log(JSON.stringify(event));
    return callback(null, {
	statusCode: 200,
	input: JSON.stringify({
	    event
	})
    });
    */
    var filename = event.Records[0].Sns.Message;

    var s3GetParams = {
	Key: filename
    };
    console.log(s3GetParams);
    s3bucket.getObject(s3GetParams, function(err, data) {
	console.log(err);
	console.log(data);
	if ( err ) {
	    return callback(err);
	} else {
	    var dynamoParams = {
		TableName: "dawilcox-character-counts",
		Item: {
		    id: filename,
		    count: parseInt(data.ContentLength)
		}
	    };
	    docClient.put(dynamoParams, function(err, data) {
		if ( err ) {
		    callback(err);
		} else {
		    callback(null, {
			statusCode: 200,
			body: "success"
		    });
		}
	    });
	}
    });
};
