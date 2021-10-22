import {
  LegacyEventStoreConfiguration,
  NextEventStoreConfiguration,
} from '../interconnection-configuration';

export class ConfigurationsHelper {
  public static isLegacyConf(
    configuration: LegacyEventStoreConfiguration | NextEventStoreConfiguration,
  ): configuration is LegacyEventStoreConfiguration {
    const confAsLegacy = (configuration as LegacyEventStoreConfiguration)
      .connectionConfig;
    return confAsLegacy && confAsLegacy.http !== undefined;
  }
}
