import { Inject, Injectable } from '@nestjs/common';
import { Driver } from '../driver';
import { ANY } from 'nestjs-geteventstore-next';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { CREDENTIALS } from '../../../constants';
import { Credentials } from '../../../interconnection-configuration';
import { jsonEvent } from '@eventstore/db-client';

@Injectable()
export class GrpcDriverService implements Driver {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
    @Inject(CREDENTIALS)
    private readonly credentials: Credentials,
  ) {}

  public async writeEvent(event: any): Promise<void> {
    const { eventStreamId } = event;
    const formattedEvent = jsonEvent({
      id: event.eventId,
      type: event.eventType,
      metadata: event.metadata,
      data: event.data,
    });
    await this.client
      .appendToStream(eventStreamId, formattedEvent, {
        expectedRevision: ANY,
        credentials: this.credentials,
      })
      .catch((e) => console.log('ERROR while grpc writing : ', e));
  }
}
