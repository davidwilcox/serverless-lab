package com.serverless;

import java.util.Collections;
import java.util.Map;

import org.apache.log4j.Logger;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

// NEW IMPORTS
import com.amazonaws.services.sns.AmazonSNSClient;
import com.amazonaws.services.sns.model.PublishRequest;
import com.amazonaws.services.sns.model.PublishResult;

import java.io.ByteArrayInputStream;
import java.util.UUID;

public class TextMessageCreate implements RequestHandler<Map<String, Object>, ApiGatewayResponse> {

	private static final Logger LOG = Logger.getLogger(TextMessageCreate.class);

	final private String username = System.getenv("USERNAME");
	final private String bucketName = "my-text-messages-" + username;

	@Override
	public ApiGatewayResponse handleRequest(Map<String, Object> input, Context context) {
		
		Object queryStringParametersObj = input.get("queryStringParameters");
                
                Map<String,String> queryStringMap = (Map<String,String>)queryStringParametersObj;
		String textToUpload = queryStringMap.get("textToUpload");

                String key = writeStringToS3(textToUpload);
		publishMessageToSNS(key);

		return ApiGatewayResponse.builder()
				.setStatusCode(200)
				.setObjectBody("your filename is:" + key)
				.setHeaders(Collections.singletonMap("X-Powered-By", "AWS Lambda & serverless"))
				.build();
	}


	private String writeStringToS3(String textToUpload) {
		AmazonS3 s3 = new AmazonS3Client();
		byte[] contentAsBytes = textToUpload.getBytes();
		ByteArrayInputStream contentsAsStream = new ByteArrayInputStream(contentAsBytes);

		ObjectMetadata metadata = new ObjectMetadata();
		metadata.setContentLength(contentAsBytes.length);
		String key = UUID.randomUUID().toString() + ".txt";
		s3.putObject(new PutObjectRequest(bucketName, key, contentsAsStream, metadata));

		return key;
	}

    	// THIS IS THE NEW PUBLISH METHOD
	private PublishResult publishMessageToSNS(String msg) {
		AmazonSNSClient snsClient = new AmazonSNSClient();
		String topicArn = "arn:aws:sns:us-east-1:272016194640:dispatch-events-" + username;
		PublishRequest publishRequest = new PublishRequest(topicArn, msg);
		PublishResult publishResult = snsClient.publish(publishRequest);

		return publishResult;
	}
}
