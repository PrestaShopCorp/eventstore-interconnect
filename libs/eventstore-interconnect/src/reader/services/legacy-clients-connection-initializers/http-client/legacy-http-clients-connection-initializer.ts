import { HTTPClient } from 'geteventstore-promise';

export const LEGACY_HTTP_CLIENT_CONNECTION_INITIALIZER = Symbol();

export interface LegacyHttpClientsConnectionInitializer {
  initClient(): Promise<void>;
  getHttpClient(): HTTPClient;
}
