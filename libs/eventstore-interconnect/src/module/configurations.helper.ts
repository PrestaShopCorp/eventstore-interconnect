import { ConnectionConfiguration } from '../interconnection-configuration';

export class ConfigurationsHelper {
  public static isLegacyConf(configuration: ConnectionConfiguration): boolean {
    return !!configuration.http;
  }
}
