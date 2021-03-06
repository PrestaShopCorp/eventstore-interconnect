import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Driver } from '../../driver';
import {
  createJsonEventData,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import {
  CONNECTION_CONFIGURATION,
  CREDENTIALS,
  EVENT_WRITER_TIMEOUT_IN_MS,
} from '../../../constants';
import {
  ConnectionConfiguration,
  Credentials,
  ExpectedVersion,
} from '../../../model/';
import { SAFETY_NET, SafetyNet } from '../../../safety-net';
import { FormattedEvent } from '../../../formatter';
import {
  TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER,
  TCPEventstoreClientsConnectionInitializer,
} from '../../../connections-initializers';
import { LOGGER } from '../../../logger';

@Injectable()
export class HttpDriverService implements Driver, OnModuleInit {
  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly connectionConfiguration: ConnectionConfiguration,
    @Inject(TCP_EVENTSTORE_CLIENT_CONNECTION_INITIALIZER)
    private readonly connectionInitializer: TCPEventstoreClientsConnectionInitializer,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.connectionInitializer.init();
    this.logger.log(
      `DRIVER : connected to ${this.connectionConfiguration.tcp.host}:${this.connectionConfiguration.tcp.port}`,
    );
  }

  public async writeEvent(event: FormattedEvent): Promise<void> {
    try {
      await this.tryToWriteEventAgainstAggressiveTimeout(
        event,
        EVENT_WRITER_TIMEOUT_IN_MS,
      );
    } catch (err) {
      this.logger.error(err.toString());
      this.safetyNet.cannotWriteEventHook(event);
    }
  }

  private async tryToWriteEventAgainstAggressiveTimeout(
    event: FormattedEvent,
    timeout: number,
  ): Promise<void> {
    const safety: NodeJS.Timeout = setTimeout(() => {
      this.safetyNet.cannotWriteEventHook(event);
    }, timeout);
    await this.appendEventToStreamteEvent(event);
    clearTimeout(safety);
  }

  private async appendEventToStreamteEvent(
    event: FormattedEvent,
  ): Promise<any> {
    this.logger.debug(
      `Trying to write ${event.metadata.eventType} (id: ${event.metadata.eventId}) on stream ${event.metadata.eventStreamId}`,
    );
    const jsonFormattedEvent = createJsonEventData(
      event.metadata.eventId,
      event.data,
      event.metadata,
      event.metadata.eventType,
    );
    const client =
      this.connectionInitializer.getConnectedClient() as EventStoreNodeConnection;

    await client.appendToStream(
      event.metadata.eventStreamId,
      ExpectedVersion.Any,
      jsonFormattedEvent,
      this.credentials,
    );
    this.logger.debug(`Event (id: ${event.metadata.eventId}) written`);
  }
}
