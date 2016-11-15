
'use strict';

var AWS = require('aws-sdk')

var s3bucket = new AWS.S3({params: {Bucket: 'my-user-input-dawilcox'}});


function guid() {
    function s4() {
	return Math.floor((1 + Math.random()) * 0x10000)
	    .toString(16)
	    .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
	s4() + '-' + s4() + s4() + s4();
}


module.exports.textmessagecreate = (event, context, callback) => {
    if ( !event || !event.input.queryStringParameters || !event.input.queryStringParameters.textToUpload ) {
	context.fail({message: "Please specify textToUpload on the query string."});
    } else {
	context.succeed({message: "Please specify textToUpload on the query string."});
    }
};
