import {
  EventBusConfigType,
  EventStoreConnectionConfig,
  EventStoreProjection,
  IEventStoreSubsystems
} from '@eventstore-interconnect';
import {LegacyConnectionSettings, LegacyEventStoreConfig} from '@nestjs-geteventstore-legacy-proxy';
import {InterconnectionConfiguration} from '@eventstore-interconnect';
import {ConfigurationV21x} from '@eventstore-interconnect';

class DumbEvent {
  constructor(
    public readonly data: any,
  ) {
  }
}

const persistentSubscriptions = [{
  stream: '$ce-eventbus_sync',
  group: 'eventbus-sync-reporting',
  onError: (error: Error) => {
    // ...
  }
}];

const projections: EventStoreProjection[] = [
  {
    name: "eventbus-shop_info",
    file: "./usecase1.projection.js",
    enabled: true,
    emitEnabled: true,
    mode: "continuous",
    trackEmittedStreams: true,
  },
];

const eventBusConnectionConfig: EventStoreConnectionConfig = {
  connectionSettings: {
    connectionString:
	 process.env.CONNECTION_STRING || 'esdb://localhost:20113?tls=false',
  },
  defaultUserCredentials: {
    username: process.env.EVENTSTORE_CREDENTIALS_USERNAME || 'admin',
    password: process.env.EVENTSTORE_CREDENTIALS_PASSWORD || 'changeit',
  },
};

const eventStoreSubsystems: IEventStoreSubsystems = {
  subscriptions: {
    persistent: persistentSubscriptions,
  },
  projections,
  onConnectionFail: (err: Error) => {
    // logger.error(`Connection to Event store hooked : ${err}`)
  }
};
const eventBusConfig: EventBusConfigType = {
  read: {
    allowedEvents: {...new DumbEvent({})},
  },
};

const confV21: ConfigurationV21x = {
  eventBusConnectionConfig,
  eventStoreSubsystems,
  eventBusConfig
}

const legacyOptions: LegacyConnectionSettings = {
  // Buffer events if remote is slow or not available
  maxQueueSize: 100_000,
  maxRetries: 10_000,
  operationTimeout: 5_000,
  operationTimeoutCheckPeriod: 1_000,

  // Fail fast on connect
  clientConnectionTimeout: 2_000,
  failOnNoServerResponse: true,

  // Try to reconnect every 10s for 30mn
  maxReconnections: 200,
  reconnectionDelay: 10_000,

  // Production heartbeat
  heartbeatInterval: 60_000,
  heartbeatTimeout: 10_000,
};


const legacyConf: LegacyEventStoreConfig = {
  credentials: {
    username:
	 'admin',
    password:
	 'changeit',
  },
  tcpConnectionName: `connection-eventbus-dumb`,
  tcp: {
    host: 'localhost',
    port: 1113,
  },
  http: {
    host: 'localhost',
    port: 2113,
  },
  options: legacyOptions,
  onTcpDisconnected: () => {
    //...
  },

  // b: {
  //   eventMapper: (data, options: IEventStoreEventOptions) => {
  // const eventType = options.eventType;
  // const Event = MetricsIntercoEvents[eventType];
  // if (!Event) return null;
  // return new Event(data, options);
  //   },
  //   subscriptions: metricsIntercoSubscriptions,
  // },
}
const conf: InterconnectionConfiguration = {
  confV21,
  legacyConf
}

export const getDumbConf = () => conf;
