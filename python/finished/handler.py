import json
import uuid
import boto3
import os 

os.environ['USERNAME'] = 'rbuck'
username = os.environ['USERNAME']
def textmessagecreate(event, context):
    if not event or not event['queryStringParameters'] or not event['queryStringParameters']['textToUpload']:
        response = {
            "statusCode": 400,
            "body": "Malformed Request: %s" % (str(event))
        }

    s3 = boto3.resource('s3')
    bucket = s3.Bucket('my-text-messages-' + username)

    key = str(uuid.uuid4()) + ".txt"
    body = event['queryStringParameters']['textToUpload']
    print key, body
    obj = bucket.put_object(Key=key, Body=body)

    # THESE TWO LINES WERE ADDED
    sns = boto3.client('sns')
    snsresp = sns.publish(Message=key,TopicArn="arn:aws:sns:us-east-1:272016194640:dispatch-events-" + username);

    body = {
        "message": "Uploaded Successfully",
        "input": str(obj)
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response

def textmessageprocess(event, context):
    s3 = boto3.resource('s3');
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table(username + '-character-counts')


    key = event['Records'][0]['Sns']['Message'];

    obj = s3.Bucket('my-text-messages-' + username).Object(key)
    objdata = obj.get()
    s = objdata['Body'].read();
    length = len(s)

    table.put_item(
        Item={
            'id': key,
            'count': length
        }
    )

    response = {
        'statusCode': 200,
        'body': 'successfully added!'
    }

    print "Successful!"
    return response
