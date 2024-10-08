import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient);

const { TABLE_NAME } = process.env;

export const handler = async (event) => {
  let connectionData;

  try {
    const scanParams = { TableName: TABLE_NAME, ProjectionExpression: 'connectionId' };
    const scanResult = await ddbDocumentClient.send(new ScanCommand(scanParams));
    connectionData = scanResult.Items;
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
    region: process.env.AWS_REGION,
    endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
  });


  const postData="responding......";
  const postCalls = connectionData.map(async ({ connectionId }) => {
    try {
      const postToConnectionCommand = new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: postData,
      });
      await apiGatewayManagementApi.send(postToConnectionCommand);
    } catch (e) {
      if (e.name === 'GoneException') {
        console.log(`Found stale connection, deleting ${connectionId}`);
        const deleteParams = {
          TableName: TABLE_NAME,
          Key: { connectionId },
        };
        await ddbDocumentClient.send(new DeleteCommand(deleteParams));
      } else {
        throw e;
      }
    }
  });

  try {
    await Promise.all(postCalls);
  } catch (e) {
    return { statusCode: 500, body: e.stack };
  }

  return { statusCode: 200, body: 'Data sent.' };
};
