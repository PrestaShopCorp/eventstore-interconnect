import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { CREDENTIALS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';

@Injectable()
export class GrpcDriverService implements Driver {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
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
        credentials: this.credentials,
      },
    );
  }
}
