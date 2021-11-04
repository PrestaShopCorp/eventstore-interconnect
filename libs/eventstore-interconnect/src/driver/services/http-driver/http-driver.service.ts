import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import {
  createJsonEventData,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { HTTP_CLIENT } from './http-connection.constants';
import { CREDENTIALS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly eventStoreNodeConnection: EventStoreNodeConnection,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
  ) {}

  public async writeEvent(event: any): Promise<any> {
    const jsonFormattedEvent = createJsonEventData(
      event.eventId,
      event.data,
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
