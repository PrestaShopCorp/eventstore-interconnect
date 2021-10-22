import { Logger, Module } from '@nestjs/common';
import { sourceEventStoreConfiguration } from './configuration/eventbus';
import { ProductsSyncEndedEvent } from './events/eventbus/products-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from './events/eventbus/google-taxonomies-sync-ended.event';
import { CategoriesSyncEndedEvent } from './events/eventbus/categories-sync-ended.event';
import { EventStoreProjectionType } from 'nestjs-geteventstore-4.0.1/dist/interfaces';
import { destEventStoreConfiguration } from './configuration/eventstore';
import { EventHandlersEventbus } from './events/handlers';
import { resolve } from 'path';
import {
  EventstoreInterconnectModule,
  LegacyEventStoreConfiguration,
} from '@eventstore-interconnect';
import Usecase1Controller from './usecase1.controller';

const projections: EventStoreProjectionType[] = [
  {
    name: 'hero-dragon2',
    file: resolve(`apps/usecase1/src/projections/hero-dragon.js`),
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
const legacyDstConf: LegacyEventStoreConfiguration = {
  connectionConfig: destEventStoreConfiguration,
  eventStoreServiceConfig: { subscriptions, projections },
  eventBusConfig,
};

@Module({
  controllers: [Usecase1Controller],
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest({
      sourceEventStoreConfiguration: legacySrcConf,
      destEventStoreConfiguration: legacyDstConf,
    }),
  ],
  providers: [Logger, ...EventHandlersEventbus],
})
export class Usecase1Module {}
