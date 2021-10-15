import {LegacyEventStoreConfig} from '@nestjs-geteventstore-legacy-proxy';
import {ConfigurationV21x} from './v21x.interfaces';


export interface InterconnectionConfiguration {
  confV21: ConfigurationV21x,
  legacyConf: LegacyEventStoreConfig
}
