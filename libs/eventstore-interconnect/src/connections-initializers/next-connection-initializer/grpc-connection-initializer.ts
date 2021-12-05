import { Client } from '@eventstore/db-client/dist/Client';

export const GRPC_CONNECTION_INITIALIZER = Symbol();

export interface GrpcConnectionInitializer {
  getConnectedClient(): Client;
  init(): Promise<void>;
}
