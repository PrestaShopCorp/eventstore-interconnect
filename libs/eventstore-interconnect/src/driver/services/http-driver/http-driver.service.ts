import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import {
  createJsonEventData,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { HTTP_CLIENT } from './http-connection.constants';
import { CREDENTIALS, EVENT_WRITER_TIMEOUT_IN_MS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';
import { SAFETY_NET, SafetyNet } from '../../../safety-net';
import { Logger } from 'nestjs-pino-stackdriver';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly eventStoreNodeConnection: EventStoreNodeConnection,
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
      this.logger.error(err.toString());
      this.safetyNet.hook(event);
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

  private async appendEventToStreamteEvent(event: any): Promise<any> {
    const jsonFormattedEvent = createJsonEventData(
      event.eventId,
      event,
      event.metadata,
      event.eventType,
    );
    await this.eventStoreNodeConnection.appendToStream(
      event.eventStreamId,
      ExpectedVersion.Any,
      jsonFormattedEvent,
      this.credentials,
    );
  }
}
