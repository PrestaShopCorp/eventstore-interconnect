import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { EventStoreService } from './event-store.service';
import { EVENT_HANDLER, EventHandler } from '../../../event-handler';
import { Logger } from 'nestjs-pino-stackdriver';

@Injectable()
export class GrpcReaderService implements Reader, OnModuleInit {
  constructor(
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
    @Inject(EVENT_HANDLER)
    private readonly eventHandler: EventHandler,
    private readonly eventStoreService: EventStoreService,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.upsertPersistantSubscription();
  }

  public async upsertPersistantSubscription(): Promise<void> {
    await this.eventStoreService.init(async (event: any) => {
      try {
        await this.eventHandler.handle(event);
      } catch (e) {
        this.logger.error(
          `Unexpected error while handling an event... Details : ${e.message}`,
        );
      }
    });
  }
}
