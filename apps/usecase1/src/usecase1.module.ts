import { Logger, Module, OnApplicationBootstrap } from '@nestjs/common';
import { eventBusConfiguration } from './configuration/eventbus';
import { ProductsSyncEndedEvent } from './events/eventbus/products-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from './events/eventbus/google-taxonomies-sync-ended.event';
import { CategoriesSyncEndedEvent } from './events/eventbus/categories-sync-ended.event';
import { EventStoreProjectionType } from 'nestjs-geteventstore-4.0.1/dist/interfaces';
import { eventStoreConfiguration } from './configuration/eventstore';
import { EventHandlersEventbus } from './events/handlers';
import {
  EventstoreInterconnectModule,
  LegacyEventStoreConfiguration,
} from '@eventstore-interconnect';

const projections: EventStoreProjectionType[] = [
  {
    name: 'hero-dragon',
    // file: resolve(`${__dirname}/src/projections/hero-dragon.js`),
    content: `
    fromCategory('$et-hero')
  .partitionBy((ev) => ev.data.dragonId)
  .when({
    HeroKilledDragonEvent: (state, event) => {
      emit(\`dragon-\${event.data.dragonId}\`, 'KilledEvent', event.data, {
        specversion: event.metadata.specversion,
        type: event.metadata.type.replace(
          'HeroKilledDragonEvent',
          'KilledEvent',
        ),
        source: event.metadata.source,
        correlation_id: event.metadata.correlation_id,
        time: event.metadata.time,
        version: 1,
      });
      return state;
    },
  });

    `,
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
  connectionConfig: eventBusConfiguration,
  eventStoreServiceConfig: { subscriptions, projections },
  eventBusConfig,
};
const legacyDstConf: LegacyEventStoreConfiguration = {
  connectionConfig: eventStoreConfiguration,
  eventStoreServiceConfig: { subscriptions, projections },
  eventBusConfig,
};

@Module({
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest({
      sourceEventStoreConfiguration: legacySrcConf,
      destEventStoreConfiguration: legacyDstConf,
    }),
  ],
  providers: [Logger, ...EventHandlersEventbus],
})
export class Usecase1Module {}
