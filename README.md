# Websocket using AWS SAM

### Introduction

Implementing chatting application using websockets in AWS SAM.

## Working

- In this application, using different routes in websocket it is implemented.
- Connect Route- Establishes a WebSocket connection and stores the unique connection ID in a DynamoDB table. This allows the server to identify active clients.
- Disconnect Route- Handles disconnection requests by removing the corresponding connection ID from the database, ensuring that inactive clients are properly tracked.
- Custom Route - Enables additional custom functionalities that may include specific actions or commands tailored for the chat application.
- Broadcast Route- Utilizes the stored connection IDs in DynamoDB to broadcast messages to all connected clients. When a user sends a message via a POST request, this route forwards the message through the WebSocket connection, allowing real-time communication among users.

### Conclusion

This chat application effectively demonstrates the working of WebSockets in delivering real-time updates using AWS SAM.
