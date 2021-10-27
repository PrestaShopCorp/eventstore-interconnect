import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver.interface';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';

@Injectable()
export class GrpcDriverService implements Driver {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
  ) {}

  public async writeEvent(event: any): Promise<void> {
    const { data, metadata, eventStreamId, eventType, eventId } = event;
    await this.client.appendToStream(
      eventStreamId,
      [
        {
          id: eventId,
          data,
          metadata,
          type: eventType,
          contentType: 'application/json',
        },
      ],
      {
        expectedRevision: ANY,
      },
    );
  }
}
