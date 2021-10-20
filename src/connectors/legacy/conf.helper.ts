import {EventBusConfigType, IEventStoreConfig, IEventStoreServiceConfig} from 'event-store-legacy';

export class DumbEvent {
}

export const dumbLegacyConnectionConf: IEventStoreConfig = {
  credentials: {
    username:
	 process.env.EVENTSTORE_METRICS_CREDENTIALS_USERNAME || 'admin',
    password:
	 process.env.EVENTSTORE_METRICS_CREDENTIALS_PASSWORD || 'changeit',
  },
  tcp: {
    host: process.env.EVENTSTORE_METRICS_TCP_ENDPOINT || 'localhost',
    port: 1113,
  },
  http: {
    host:
	 process.env.EVENTSTORE_METRICS_HTTP_ENDPOINT || 'http://localhost',
    port: 2113,
  },
  tcpConnectionName: `dumb-connection`,
  options: {
    // Buffer events if remote is slow or not available
    maxQueueSize: 100_000,
    maxRetries: 10_000,
    operationTimeout: 5_000,
    operationTimeoutCheckPeriod: 1_000,
    // Fail fast on connect
    clientConnectionTimeout: 2_000,
    failOnNoServerResponse: false,
    // Try to reconnect every 10s for 30mn
    maxReconnections: 200,
    reconnectionDelay: 10_000,
    // Production heartbeat
    heartbeatInterval: 10_000,
    heartbeatTimeout: 3_000,
  },
  onTcpDisconnected: () => {
  },
  onTcpConnected: () => ({}),
};

const onSubscriptionDropped = (sub, reason, error) => {
};

const dumbEvent: DumbEvent = new DumbEvent();
const allowedEvents = {
  ... dumbEvent
}

export const dumbEventStoreLegacyServiceConfig: IEventStoreServiceConfig = {
  subscriptions: {
    persistent: [
	 {
	   stream: '$ce-analytics_google_accounts',
	   group: 'metrics-api',
	   autoAck: false,
	   options: {
		minCheckPointCount: 1,
		resolveLinkTos: true,
		readBatchSize: 1,
	   },
	   onSubscriptionDropped,
	 },
    ],
  },
};

export const dumbEventBusConfigType: EventBusConfigType = {

  read: {
    allowedEvents,
  },
  write: {
    serviceName: 'test',
  },
}
