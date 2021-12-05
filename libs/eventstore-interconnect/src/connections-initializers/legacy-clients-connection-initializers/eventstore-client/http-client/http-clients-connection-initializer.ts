import { HTTPClient } from 'geteventstore-promise';

export const HTTP_CLIENT_CONNECTION_INITIALIZER = Symbol();

export interface HttpClientsConnectionInitializer {
  init(): Promise<void>;
  getHttpClient(): HTTPClient;
}
