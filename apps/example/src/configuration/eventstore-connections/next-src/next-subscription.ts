import { IPersistentSubscriptionConfig } from 'nestjs-geteventstore-next';

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
      },
    },
    onError: (err: Error) => console.log(`An error occurred : ${err.message}`),
  },
];
