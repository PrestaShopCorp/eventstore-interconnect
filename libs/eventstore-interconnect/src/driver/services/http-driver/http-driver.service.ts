import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver.interface';
import { ExpectedVersion } from 'nestjs-geteventstore-legacy';
import {
  createJsonEventData,
  EventStoreNodeConnection,
} from 'node-eventstore-client';
import { createEventDefaultMetadata } from 'nestjs-geteventstore-legacy/dist/tools/create-event-default-metadata';
import { HTTP_CLIENT } from './http-connection.constants';

@Injectable()
export class HttpDriverService implements Driver {
  constructor(
    @Inject(HTTP_CLIENT)
    private readonly eventStoreNodeConnection: EventStoreNodeConnection,
  ) {}

  public async writeEvent(event: any): Promise<any> {
    const jsonFormattedEvent = createJsonEventData(
      event.eventId,
      event.data,
      { ...createEventDefaultMetadata(), ...event.metadata },
      event.eventType,
    );
    await this.eventStoreNodeConnection.appendToStream(
      event.eventStreamId,
      ExpectedVersion.Any,
      jsonFormattedEvent,
    );
  }
}
