import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { CREDENTIALS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';
import { jsonEvent } from '@eventstore/db-client';
import { SAFETY_NET, SafetyNet } from '../../../safety-net';
import { Logger } from 'nestjs-pino-stackdriver';
import { EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';

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

  public async writeEvent(event: any): Promise<void> {
    try {
      await this.tryToWriteEventAgainstAggressiveTimeout(
        event,
        EVENT_WRITER_TIMEOUT_IN_MS,
      );
    } catch (err) {
      this.safetyNet.hook(event);
      this.logger.error(err.toString());
    }
  }

  private async tryToWriteEventAgainstAggressiveTimeout(
    event: any,
    timeout: number,
  ): Promise<void> {
    let eventWritten = false;
    setTimeout(() => {
      this.safetyNet.hook(event, eventWritten);
    }, timeout);
    this.appendEventToStreamteEvent(event).then(() => (eventWritten = true));
    await event.ack();
  }

  private async appendEventToStreamteEvent(event: any): Promise<void> {
    this.logger.log(
      `Trying to write ${event.eventType} (id: ${event.eventId}) on stream ${event.eventStreamId}`,
    );
    const { eventStreamId } = event;
    const formattedEvent = jsonEvent({
      id: event.eventId,
      type: event.eventType,
      metadata: event.metadata,
      data: event.data,
    });
    await this.client.appendToStream(eventStreamId, formattedEvent, {
      expectedRevision: ANY,
      credentials: this.credentials,
    });
    this.logger.log(`Event (id: ${event.eventId}) written`);
  }
}
