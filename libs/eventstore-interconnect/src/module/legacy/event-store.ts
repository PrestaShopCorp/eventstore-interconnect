import { Logger } from '@nestjs/common';
import {
  createConnection,
  EventStoreNodeConnection,
  EventStorePersistentSubscription,
} from 'node-eventstore-client';
import * as geteventstorePromise from 'geteventstore-promise';
import { HTTPClient } from 'geteventstore-promise';
import { ISubscriptionStatus } from 'nestjs-geteventstore-legacy';
import { IEventStoreConfig } from './event-store-config.interface';

// import { IEventStoreConfig, ISubscriptionStatus } from '../interfaces';

export class EventStore {
  private logger: Logger = new Logger(this.constructor.name);
  public connection: EventStoreNodeConnection;
  public readonly HTTPClient: HTTPClient;
  public isConnected = false;
  private persistentSubscriptions: ISubscriptionStatus = {};

  constructor(public readonly config: IEventStoreConfig) {
    this.HTTPClient = new geteventstorePromise.HTTPClient({
      hostname: config.http.host.replace(/^https?:\/\//, ''),
      port: config.http.port,
      credentials: {
        username: config.credentials.username,
        password: config.credentials.password,
      },
    });
  }

  async connect() {
    this.connection = createConnection(
      {
        ...this.config.options,
        defaultUserCredentials: this.config.credentials,
      },
      this.config.tcp || this.config.clusterDns,
      this.config.tcpConnectionName,
    );
    this.logger.debug('Connecting to EventStore');
    await this.connection.connect();

    this.connection.on('connected', () => {
      this.logger.log('Connection to EventStore established!');
      this.isConnected = true;
      this.config.onTcpConnected(this);
    });
    this.connection.on('closed', () => {
      this.isConnected = false;
      this.logger.error('Connection to EventStore closed!');
      this.config.onTcpDisconnected(this);
    });
  }

  close() {
    this.connection.close();
  }

  get subscriptions(): {
    persistent: ISubscriptionStatus;
  } {
    return {
      persistent: this.persistentSubscriptions,
    };
  }

  async readEventsForward({ stream, first = 0, count = 1000 }) {
    return await this.HTTPClient.readEventsForward(stream, first, count);
  }

  async subscribeToPersistentSubscription(
    stream: string,
    group: string,
    onEvent: (sub, payload) => void,
    autoAck = false,
    bufferSize = 10,
    onSubscriptionStart: (sub) => void = undefined,
    onSubscriptionDropped: (sub, reason, error) => void = undefined,
  ): Promise<EventStorePersistentSubscription> {
    try {
      return await this.connection
        .connectToPersistentSubscription(
          stream,
          group,
          onEvent,
          (subscription, reason, error) => {
            this.logger.warn(
              `Connected to persistent subscription ${group} on stream ${stream} dropped ${reason} : ${error}`,
            );
            this.persistentSubscriptions[`${stream}-${group}`].isConnected =
              false;
            this.persistentSubscriptions[`${stream}-${group}`].status =
              reason + ' ' + error;
            if (onSubscriptionDropped) {
              onSubscriptionDropped(subscription, reason, error);
            }
          },
          undefined,
          bufferSize,
          autoAck,
        )
        .then((subscription) => {
          this.logger.log(
            `Connected to persistent subscription ${group} on stream ${stream}!`,
          );
          this.persistentSubscriptions[`${stream}-${group}`] = {
            isConnected: true,
            streamName: stream,
            group: group,
            subscription: subscription,
            status: `Connected to persistent subscription ${group} on stream ${stream}!`,
          };
          if (onSubscriptionStart) {
            onSubscriptionStart(subscription);
          }
          return subscription;
        });
    } catch (err) {
      this.logger.error(err.message);
    }
  }
}
