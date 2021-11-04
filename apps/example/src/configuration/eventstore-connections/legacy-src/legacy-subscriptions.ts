import { IEventStorePersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy';

export const legacySubscriptions: IEventStorePersistentSubscriptionConfig[] = [
  {
    // Event stream category (before the -)
    stream: '$ce-hero',
    group: 'data',
    autoAck: true,
    bufferSize: 1,
    // Subscription is created with this options
    options: {
      resolveLinkTos: true,
      minCheckPointCount: 1,
    },
    onSubscriptionStart: () => {},
    onSubscriptionDropped: () => {},
  },
];
