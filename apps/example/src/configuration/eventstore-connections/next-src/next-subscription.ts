import { IPersistentSubscriptionConfig } from 'nestjs-geteventstore-next';

export const nextSubscriptions: IPersistentSubscriptionConfig[] = [
  {
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
  },
];
