import { jsonEvent } from '@eventstore/db-client';
import { Client } from '@eventstore/db-client/dist/Client';
import { EventData } from '@eventstore/db-client/dist/types/events';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  GrpcConnectionInitializer,
  GRPC_CONNECTION_INITIALIZER,
} from '../../../connections-initializers';
import {
  CONNECTION_CONFIGURATION,
  CREDENTIALS,
  EVENT_WRITER_TIMEOUT_IN_MS,
} from '../../../constants';
import { FormattedEvent } from '../../../formatter';
import { ConnectionConfiguration, Credentials } from '../../../model';
import { SafetyNet, SAFETY_NET } from '../../../safety-net';
import { ANY } from '../../constants';
import { Driver } from '../../driver';

@Injectable()
export class GrpcDriverService implements Driver, OnModuleInit {
  constructor(
    @Inject(CONNECTION_CONFIGURATION)
    private readonly connectionConfiguration: ConnectionConfiguration,
    @Inject(GRPC_CONNECTION_INITIALIZER)
    private readonly connectionInitializer: GrpcConnectionInitializer,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.connectionInitializer.init();
    this.logger.log(
      `DRIVER : connected to ${this.connectionConfiguration.connectionString}`,
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
  ): Promise<void> {
    this.logger.debug(
      `Trying to write ${event.metadata.eventType} (id: ${event.metadata.eventId}) on stream ${event.metadata.eventStreamId}`,
    );
    const { data, metadata } = event;

    const formattedEvent: EventData = jsonEvent({
      id: event.metadata.eventId,
      type: event.metadata.eventType,
      data,
      metadata,
    });

    const client: Client = this.connectionInitializer.getConnectedClient();

    await client.appendToStream(event.metadata.eventStreamId, formattedEvent, {
      expectedRevision: ANY,
      credentials: this.credentials,
    });
    this.logger.debug(`Event (id: ${event.metadata.eventId}) written`);
  }
}
