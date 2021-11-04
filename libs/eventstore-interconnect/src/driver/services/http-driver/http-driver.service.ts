import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import {
  createJsonEventData,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { HTTP_CLIENT } from './http-connection.constants';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly eventStoreNodeConnection: EventStoreNodeConnection,
  ) {}

  public async writeEvent(event: any): Promise<any> {
    console.log('DRIVER (http) writing event : ', event);
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
      { username: 'admin', password: 'changeit' },
    );
  }
}
