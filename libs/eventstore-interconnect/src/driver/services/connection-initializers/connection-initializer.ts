export const CONNECTION_INITIALIZER = Symbol();

export interface ConnectionInitializer {
  getConnectedClient();
}
