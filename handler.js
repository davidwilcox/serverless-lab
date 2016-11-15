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

var s3bucket = new AWS.S3({params: {Bucket: 'my-text-messages3-dawilcox'}});

module.exports.textmessagecreate = (event, context, callback) => {
    console.log(event);
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

module.exports.textmessagecreate = (event, context, callback) => {
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey    =
	decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    
};
