import { IPersistentSubscriptionConfig } from '@eventstore-interconnect';

export const nextSubscriptions: IPersistentSubscriptionConfig[] = [
  {
    // Event stream category (before the -)
    stream: '$ce-hero',
    group: 'data',
    optionsForConnection: {
      subscriptionConnectionOptions: { bufferSize: 1 },
    },
    settingsForCreation: {
      subscriptionSettings: {
        liveBufferSize: 1,
        resolveLinkTos: true,
        startFrom: "start",
        readBatchSize: 1
      },
    },
    onError: (err: Error) => console.log(`An error occurred : ${err.message}`),
    onSubscriptionDropped: () =>
      console.log(`The persistent subscription were dropped`),
  },
];
