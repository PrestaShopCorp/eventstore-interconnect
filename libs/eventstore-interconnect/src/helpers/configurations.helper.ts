import { ConnectionConfiguration } from '../interconnection-configuration';

export const isLegacyConf = (
  configuration: ConnectionConfiguration,
): boolean => {
  return !!configuration.http;
};
