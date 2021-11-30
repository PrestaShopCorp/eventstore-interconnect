import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../../driver';
import { ANY } from 'nestjs-geteventstore-next';
import { CREDENTIALS, EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';
import { jsonEvent } from '@eventstore/db-client';
import { SAFETY_NET, SafetyNet } from '../../../safety-net';
import { Logger } from 'nestjs-pino-stackdriver';
import { FormattedEvent } from '../../../formatter';
import { EventData } from '@eventstore/db-client/dist/types/events';
import {
  CONNECTION_INITIALIZER,
  ConnectionInitializer,
} from '../connection-initializers/connection-initializer';
import { Client } from '@eventstore/db-client/dist/Client';

@Injectable()
export class GrpcDriverService implements Driver {
  constructor(
    @Inject(CONNECTION_INITIALIZER)
    private readonly connectionInitializer: ConnectionInitializer,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
    @Inject(SAFETY_NET) protected readonly safetyNet: SafetyNet,
    private readonly logger: Logger,
  ) {}

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
    let eventWritten = false;
    await Promise.race([
      setTimeout(() => {
        this.safetyNet.cannotWriteEventHook(event, eventWritten);
      }, timeout),
      this.appendEventToStreamteEvent(event).finally(
        () => (eventWritten = true),
      ),
    ]);
  }

  private async appendEventToStreamteEvent(
    event: FormattedEvent,
  ): Promise<void> {
    this.logger.log(
      `Trying to write ${event.metadata.eventType} (id: ${event.metadata.eventId}) on stream ${event.metadata.eventStreamId}`,
    );
    const { data, metadata } = event;

    const formattedEvent: EventData = jsonEvent({
      id: event.metadata.eventId,
      type: event.metadata.eventType,
      data,
      metadata,
    });

    const client = this.connectionInitializer.getConnectedClient() as Client;

    await client.appendToStream(event.metadata.eventStreamId, formattedEvent, {
      expectedRevision: ANY,
      credentials: this.credentials,
    });
    this.logger.log(`Event (id: ${event.metadata.eventId}) written`);
  }
}
