import { IPersistentSubscriptionConfig } from 'nestjs-geteventstore-legacy';

export const legacySubscriptions: IPersistentSubscriptionConfig[] = [
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
    onSubscriptionStart: () => {},
    onSubscriptionDropped: () => {},
  },
];
