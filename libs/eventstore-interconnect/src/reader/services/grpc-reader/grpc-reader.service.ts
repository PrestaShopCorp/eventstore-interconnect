import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Reader } from '../reader';
import { EVENT_STORE_CONNECTOR } from 'nestjs-geteventstore-next/dist/event-store/services/event-store.constants';
import { Client } from '@eventstore/db-client/dist/Client';
import { EventStoreService } from './event-store.service';
import { Driver, DRIVER } from '../../../driver';
import { VALIDATOR, Validator } from '../validator/validator';
import { Logger } from 'nestjs-pino-stackdriver';

@Injectable()
export class GrpcReaderService implements Reader, OnModuleInit {
  constructor(
    private readonly eventStoreService: EventStoreService,
    @Inject(EVENT_STORE_CONNECTOR)
    private readonly client: Client,
    @Inject(DRIVER)
    private readonly driver: Driver,
    @Inject(VALIDATOR)
    private readonly validatorService: Validator,
    private readonly logger: Logger,
  ) {}

  public async onModuleInit(): Promise<void> {
    await this.upsertPersistantSubscription();
  }

  public async upsertPersistantSubscription(): Promise<void> {
    await this.eventStoreService.startWithOnEvent(async (event: any) => {
      try {
        const validatedEvent = await this.validatorService.validate(event);
        validatedEvent.eventStreamId = event.event.streamId;
        await this.driver.writeEvent(validatedEvent);
      } catch (e) {
        this.logger.error('Error while writing an event : ', e.message);
      }
    });
  }
}
