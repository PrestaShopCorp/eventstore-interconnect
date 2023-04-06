import { IEventStorePersistentSubscriptionConfig } from '@eventstore-interconnect';

export const legacySubscriptions: IEventStorePersistentSubscriptionConfig[] = [
  // {
  //   // Event stream category (before the -)
  //   stream: '$ce-hero',
  //   group: 'data',
  //   autoAck: true,
  //   bufferSize: 1,
  //   // Subscription is created with this options
  //   options: {
  //     resolveLinkTos: true,
  //
  //     // checkpoint at every event
  //     minCheckPointCount: 1,
  //
  //     // maximum number of concurrent events
  //     readBatchSize: 1,
  //   },
  //   onSubscriptionStart: () => {
  //     console.log('sub hero started');
  //   },
  //   onSubscriptionDropped: () => {
  //     console.log('sub hero dropped');
  //   },
  // },
  {
    stream: '$et-JobStartedEvent',
    group: 'debug-interco-test',
    autoAck: true,
    options: {
      startFrom: 0,
      resolveLinkTos: true,
      minCheckPointCount: 1,
      readBatchSize: 10,
    },
    onSubscriptionDropped: () => {
      console.log('sub hero dropped');
    },
  },
  {
    stream: '$et-JobEndedEvent',
    group: 'debug-interco-test',
    autoAck: true,
    options: {
      startFrom: 0,
      resolveLinkTos: true,
      minCheckPointCount: 1,
      readBatchSize: 10,
    },
    onSubscriptionDropped: () => {
      console.log('sub hero dropped');
    },
  },
];
