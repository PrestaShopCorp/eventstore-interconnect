import { ConnectionConfiguration } from '../interconnection-configuration';

export const isLegacyConf = (
  configuration: ConnectionConfiguration,
): boolean => {
  return !!configuration.http;
};

export const getLegacyUsername = (
  entry: 'source' | 'dest',
  username: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_SRC
      : process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_DEST) || username
  );
};

export const getLegacyPassword = (
  entry: 'source' | 'dest',
  pwd: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_SRC
      : process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_DST) || pwd
  );
};

export const getLegacyHttpPort = (
  entry: 'source' | 'dest',
  port: number,
): number => {
  return (
    (entry === 'source'
      ? +process.env.EVENTSTORE_INTERCO_HTTP_PORT_SRC
      : +process.env.EVENTSTORE_INTERCO_HTTP_PORT_DST) || port
  );
};

export const getLegacyHttpHost = (
  entry: 'source' | 'dest',
  host: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_HTTP_ENDPOINT_SRC
      : process.env.EVENTSTORE_INTERCO_HTTP_ENDPOINT_DST) || host
  );
};

export const getLegacyTcpPort = (
  entry: 'source' | 'dest',
  port: number,
): number => {
  return (
    (entry === 'source'
      ? +process.env.EVENTSTORE_INTERCO_TCP_PORT_SRC
      : +process.env.EVENTSTORE_INTERCO_TCP_PORT_DST) || port
  );
};

export const getLegacyTcpHost = (
  entry: 'source' | 'dest',
  host: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_TCP_ENDPOINT_SRC
      : process.env.EVENTSTORE_INTERCO_TCP_ENDPOINT_DST) || host
  );
};
export const getNextUsername = (
  entry: 'source' | 'dest',
  username: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_SRC
      : process.env.EVENTSTORE_INTERCO_CREDENTIALS_USERNAME_DST) || username
  );
};

export const getNextPassword = (
  entry: 'source' | 'dest',
  pwd: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_SRC
      : process.env.EVENTSTORE_INTERCO_CREDENTIALS_PASSWORD_DST) || pwd
  );
};

export const getConnectionString = (
  entry: 'source' | 'dest',
  connectionString: string,
): string => {
  return (
    (entry === 'source'
      ? process.env.EVENTSTORE_INTERCO_CONNECTION_STRING_SRC
      : process.env.EVENTSTORE_INTERCO_CONNECTION_STRING_DST) ||
    connectionString
  );
};
