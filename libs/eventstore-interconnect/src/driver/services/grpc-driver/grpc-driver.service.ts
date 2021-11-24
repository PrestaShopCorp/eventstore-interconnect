import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../../driver';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { CREDENTIALS, EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';
import { jsonEvent } from '@eventstore/db-client';
import { SAFETY_NET, SafetyNet } from '../../../safety-net';
import { Logger } from 'nestjs-pino-stackdriver';
import { FormattedEvent } from '../../../formatter';
import { EventData } from '@eventstore/db-client/dist/types/events';

@Injectable()
export class GrpcDriverService implements Driver {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
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
    setTimeout(() => {
      this.safetyNet.cannotWriteEventHook(event, eventWritten);
    }, timeout);
    this.appendEventToStreamteEvent(event).finally(() => (eventWritten = true));
  }

  private async appendEventToStreamteEvent(
    event: FormattedEvent,
  ): Promise<void> {
    this.logger.log(
      `Trying to write ${event.type} (id: ${event.eventId}) on stream ${event.streamId}`,
    );
    const { type, data, metadata, eventId, streamId } = event;

    const formattedEvent: EventData = jsonEvent({
      id: eventId,
      type,
      data,
      metadata,
    });
    await this.client.appendToStream(streamId, formattedEvent, {
      expectedRevision: ANY,
      credentials: this.credentials,
    });
    this.logger.log(`Event (id: ${event.eventId}) written`);
  }
}
