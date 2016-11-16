'use strict';

var AWS = require('aws-sdk');


function guid() {
    function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}

var bucket_name = 'my-text-messages9-dawilcox';
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
			    callback(err);
			} else {
			    callback(null,{
				statusCode: 200,
				body: JSON.stringify(data)
			    });
			}
		    });
};



var docClient = new AWS.DynamoDB.DocumentClient();

module.exports.textmessageprocess = (event, context, callback) => {
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
	decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    var s3GetParams = {
	Bucket: bucket_name,
	Key: srcKey
    };
    s3bucket.getObject(s3GetParams, function(err, data) {
	if ( err ) {
	    return callback(err);
	} else {
	    var dynamoParams = {
		TableName: "dawilcox-character-counts",
		Item: {
		    id: srcKey,
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
