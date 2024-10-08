import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  const putParams = {
    TableName: process.env.TABLE_NAME,
    Item: {
      connectionId: event.requestContext.connectionId,
    },
  };

  try {
    await ddbDocumentClient.send(new PutCommand(putParams));
  } catch (err) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Connected.' };
};
