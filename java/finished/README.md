# Serverless Lab in Java using Maven

Let's create our service first. We need to create our project by using serverless create.

```bash
sls create --template aws-java-maven --path $USER-serverless-example
```

This command created a number of files.
* serverless.yaml - This controls your entire project. It determines what is deployed and where it is deployed to.
* event.json - This contains possible test data that can be sent to your service after it is deployed.
* pom.xml - This is your maven pom file for your source code.
* src - This directory contains example java code.

The first thing we're going to do is run the default "Hello World" function that was auto generated using the `sls create` command. Before deploying this code you need to edit your serverless.yaml file so your project does not collide with anyone else's in this lab. Edit the file so the value following the `service:` key is unique. Something like `yourname-java-maven`. Now run the following commands:

```bash
mvn package
sls deploy
```

Eventually, when this completes successfully, you should see something like the following:

```bash
Serverless: Creating Stack…
Serverless: Checking Stack create progress…
.....
Serverless: Stack create finished…
Serverless: Deprecation Notice: Starting with the next update, we will drop support for Lambda to implicitly create LogGroups. Please remove your log groups and set "provider.cfLogs: true", for CloudFormation to explicitly create them for you.
Serverless: Uploading CloudFormation file to S3…
Serverless: Uploading service .zip file to S3…
Serverless: Updating Stack…
Serverless: Checking Stack update progress…
............
Serverless: Stack update finished…

Service Information
service: pauls-java-maven
stage: dev
region: us-east-1
api keys:
  None
endpoints:
  None
functions:
  pauls-java-maven-dev-hello: arn:aws:lambda:us-east-1:272016194640:function:pauls-java-maven-dev-hello
```

You just created a lambda function! The lambda function is in src/main/java/hello/Handler.java. Take a look at it now.

```java
package hello;

import java.io.IOException;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

public class Handler implements RequestHandler<Request, Response> {

	@Override
	public Response handleRequest(Request input, Context context) {
		return new Response("Go Serverless v1.0! Your function executed successfully!", input);
	}

}
```
This function echos out a nice message as well as relaying any input back out to the output. To try it out run the following:

```bash
#Remote execution
$ sls invoke --function hello --path event.json
{
    "message": "Go Serverless v1.0! Your function executed successfully!",
    "request": {
        "key1": "value1",
        "key2": "value2",
        "key3": "value3"
    }
}
```

You will notice that you invoked the function hello. If you look in your serverless.yaml file you will see that the `hello` function is associated with the `hello.Handler` class. This is how the correct function is called.

Cool! Let's add a simple web interface on top of our lambda function to make it accessible to the world wide web. We use Amazon's API gateway for this. We do this by inserting a few lines below the `hello` function in serverless.yml to enable the interface. Edit serverless.yaml. Find the section that defines the `hello` function. You will add an events section so that it looks like the following:

```yaml
functions:
  hello:
    handler: hello.Handler
    events:
      - http:
          path: hello
          method: get
```

Now deploy the changes we made to our service.

```bash
sls deploy
```

Notice in the output of the deploy command this time that there is a endpoint. You can access that url from either curl or your browser.

```bash
endpoints:
  GET - https://a7p7samuq2.execute-api.us-east-1.amazonaws.com/dev/hello
```
