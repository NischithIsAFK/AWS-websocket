import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  const deleteParams = {
    TableName: process.env.TABLE_NAME,
    Key: {
      connectionId: event.requestContext.connectionId,
    },
  };

  try {
    await ddbDocumentClient.send(new DeleteCommand(deleteParams));
  } catch (err) {
    return {
      statusCode: 500,
      body: "Failed to disconnect: " + JSON.stringify(err),
    };
  }

  return { statusCode: 200, body: "Disconnected." };
};
