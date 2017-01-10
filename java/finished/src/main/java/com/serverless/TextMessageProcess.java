package com.serverless;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClient;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PutItemOutcome;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SNSEvent;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.GetObjectRequest;
import com.amazonaws.services.s3.model.S3Object;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;

public class TextMessageProcess implements RequestHandler<SNSEvent, String> {
    final private String username = System.getenv("USERNAME");
    final private String bucketName = "my-text-messages-" + username;

    public String handleRequest(SNSEvent request, Context context){
        String result;
        String s3Filename = request.getRecords().get(0).getSNS().getMessage();

        int count = characterCount(s3Filename);
        writeCountToDynamoDB(s3Filename, count);
        result = String.format("Recorded %d characters for %s", count, s3Filename);

        context.getLogger().log(result);
        return result;
    }

    private int characterCount(String s3Filename) {
        AmazonS3 s3 = new AmazonS3Client();
        S3Object s3object = s3.getObject(new GetObjectRequest(bucketName, s3Filename));
        BufferedReader reader = new BufferedReader(new InputStreamReader(s3object.getObjectContent()));
        String line;
        int count = 0;
        try {
            while ((line = reader.readLine()) != null) {
                count += line.length();
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not process " + s3Filename, e);
        }
        return count;
    }

    private PutItemOutcome writeCountToDynamoDB(String s3Filename, int count) {
        AmazonDynamoDBClient client = new AmazonDynamoDBClient();
        DynamoDB dynamoDB = new DynamoDB(client);
        Table table = dynamoDB.getTable(username + "-character-counts");

        PutItemOutcome outcome = table.putItem(new Item()
                .withPrimaryKey("id", s3Filename)
                .withInt("count", count));

        return outcome;
    }
}
