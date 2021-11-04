import { Inject, Injectable } from '@nestjs/common';
import { Reader } from '../reader';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { InterconnectionConfiguration } from '../../../interconnection-configuration';

@Injectable()
export class GrpcReaderService implements Reader {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
  ) {
    console.log('grpcReader');
  }

  public upsertPersistantSubscription(
    configuration: InterconnectionConfiguration,
  ) {}
}
