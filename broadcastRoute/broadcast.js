import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbClient = new DynamoDBClient({ region: "us-east-1" });
const ddbDocumentClient = DynamoDBDocumentClient.from(ddbClient);

// Ensure TABLE_NAME is defined in your environment variables
const TABLE_NAME = process.env.TABLE_NAME; // Define your table name from environment variables

export const handler = async (event) => {
  // Extract message from the input event
  const { message } = JSON.parse(event.body); // Assuming the event body is a JSON string
  let connectionData;

  try {
    const scanParams = {
      TableName: TABLE_NAME,
      ProjectionExpression: "connectionId",
    };
    const scanResult = await ddbDocumentClient.send(
      new ScanCommand(scanParams)
    );
    connectionData = scanResult.Items;

    // Ensure that connectionData is not empty before accessing it
    if (!connectionData || connectionData.length === 0) {
      return { statusCode: 404, body: "No connections found." };
    }

    // Use the first connectionId directly without a separate variable
    const connectionId = connectionData[0].connectionId; // No need for .S if using DynamoDBDocumentClient
  } catch (e) {
    console.error("Error scanning DynamoDB: ", e);
    return { statusCode: 500, body: e.stack };
  }

  // Correct endpoint for the WebSocket
  const client = new ApiGatewayManagementApiClient({
    endpoint: "https://72ywftg016.execute-api.us-east-1.amazonaws.com/Prod/", // Ensure this is the correct WebSocket API endpoint
  });

  // Prepare the input for PostToConnectionCommand
  const input = {
    Data: message, // Convert message to Buffer if sending binary data
    ConnectionId: connectionData[0].connectionId, // Use connectionId from the scan result
  };

  // Create the command
  const command = new PostToConnectionCommand(input);

  try {
    // Send the command
    const response = await client.send(command);
    console.log(response);
    return { statusCode: 200, body: "Message sent successfully" };
  } catch (error) {
    console.error("Error posting message: ", error);
    return { statusCode: 500, body: "Failed to send message" };
  }
};
