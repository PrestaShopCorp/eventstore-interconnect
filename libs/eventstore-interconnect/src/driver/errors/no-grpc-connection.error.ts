export class NoGrpcConnectionError extends Error {
  constructor(message: string, connectionString) {
    super(
      `Connection to gRPC eventstore failed while trying to connect to ${connectionString}. Details: ${message}`,
    );
  }
}
