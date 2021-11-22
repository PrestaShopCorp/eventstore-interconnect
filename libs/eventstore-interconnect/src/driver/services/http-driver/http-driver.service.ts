import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../../driver';
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
import { FormattedEvent } from '../../../formatter';

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

  public async writeEvent(event: FormattedEvent): Promise<void> {
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
    event: FormattedEvent,
    timeout: number,
  ): Promise<void> {
    let eventWritten = false;
    setTimeout(() => {
      this.safetyNet.hook(event, eventWritten);
    }, timeout);
    await this.appendEventToStreamteEvent(event);
    eventWritten = true;
  }

  private async appendEventToStreamteEvent(
    event: FormattedEvent,
  ): Promise<any> {
    const jsonFormattedEvent = createJsonEventData(
      event.eventId,
      event,
      event.metadata,
      event.type,
    );
    await this.eventStoreNodeConnection.appendToStream(
      event.streamId,
      ExpectedVersion.Any,
      jsonFormattedEvent,
      this.credentials,
    );
  }
}
