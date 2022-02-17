import { ConnectionConfiguration } from '../model';

export const isLegacyConf = (
  configuration: ConnectionConfiguration,
): boolean => {
  return !configuration.connectionString;
};
