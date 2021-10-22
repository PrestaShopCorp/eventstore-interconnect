import { Logger, Module } from '@nestjs/common';
import { sourceEventStoreConfiguration } from '../configuration/eventbus';
import { ProductsSyncEndedEvent } from '../events/eventbus/products-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from '../events/eventbus/google-taxonomies-sync-ended.event';
import { CategoriesSyncEndedEvent } from '../events/eventbus/categories-sync-ended.event';
import { EventStoreProjectionType } from 'nestjs-geteventstore-legacy';
import { destEventStoreConfiguration } from '../configuration/eventstore';
import { resolve } from 'path';
import {
  EventstoreInterconnectModule,
  LegacyEventStoreConfiguration,
  NextEventStoreConfiguration,
} from '@eventstore-interconnect';
import v5ToV21Controller from './v5-to-v21.controller';
import { IPersistentSubscriptionConfig } from 'nestjs-geteventstore-next';
import { EventHandlersEventbus } from '../events/handlers';

const projections: EventStoreProjectionType[] = [
  {
    name: 'hero-dragon2',
    file: resolve(`apps/v5-to-v5/src/projections/hero-dragon.js`),
    mode: 'continuous',
    enabled: true,
    checkPointsEnabled: true,
    emitEnabled: true,
  },
];
const subscriptions = {
  persistent: [
    {
      // Event stream category (before the -)
      stream: '$ce-hero',
      group: 'data',
      autoAck: false,
      bufferSize: 1,
      // Subscription is created with this options
      options: {
        resolveLinkTos: true,
        minCheckPointCount: 1,
      },
    },
  ],
};

const destEventStorePersSub: IPersistentSubscriptionConfig = {
  // Event stream category (before the -)
  stream: '$ce-hero',
  group: 'data',
  settingsForCreation: {
    subscriptionSettings: {
      resolveLinkTos: true,
      minCheckpointCount: 1,
    },
  },
  onError: (err: Error) => console.log(`An error occurred : ${err.message}`),
};

const eventBusConfig = {
  read: {
    allowedEvents: {
      ProductsSyncEndedEvent,
      GoogleTaxonomiesSyncEndedEvent,
      CategoriesSyncEndedEvent,
    },
  },
  write: {
    serviceName: 'test',
  },
};

const legacySrcConf: LegacyEventStoreConfiguration = {
  connectionConfig: sourceEventStoreConfiguration,
  eventStoreServiceConfig: { subscriptions, projections },
  eventBusConfig,
};
const nextDstConf: NextEventStoreConfiguration = {
  eventStoreConfig: destEventStoreConfiguration,
  eventStoreSubsystems: {
    subscriptions: {
      persistent: [destEventStorePersSub],
    },
    onConnectionFail: () => {},
    onEvent: () => {},
  },
  eventBusConfig,
};

@Module({
  controllers: [v5ToV21Controller],
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest({
      sourceEventStoreConfiguration: legacySrcConf,
      destEventStoreConfiguration: nextDstConf,
    }),
  ],
  providers: [Logger, ...EventHandlersEventbus],
})
export class v5ToV21Module {}
