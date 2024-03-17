import { fromIni } from "@aws-sdk/credential-provider-ini";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDBClient = new DynamoDBClient({
  region: "ap-south-1",
  // formIni() automatically take's credentials from ~/.aws/credentials or AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env
  credentials: fromIni({}),
});

const db = DynamoDBDocumentClient.from(dynamoDBClient);

export { db };
