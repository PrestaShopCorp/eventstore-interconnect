import { Controller, Get } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ProductsSyncEndedEvent } from './events/products-sync-ended.event';
import { EventOptionsType } from 'nestjs-geteventstore-next';
import { CategoriesSyncEndedEvent } from './events/categories-sync-ended.event';

@Controller('/')
export default class usecaseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  @Get('start')
  public async emitEvents(): Promise<void> {
    const options: EventOptionsType = {
      eventNumber: 0,
      originalEventId: '',
      eventStreamId: 'test',
      metadata: {
        correlation_id: 'fff',
        version: 123,
        type: 'int.e',
        source: 'bla',
        time: new Date().toISOString(),
        specversion: 1,
      },
    };
    this.eventBus.publish(new ProductsSyncEndedEvent({}, options));

    const catSyncEvent: CategoriesSyncEndedEvent = new CategoriesSyncEndedEvent(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    this.eventBus.publish(catSyncEvent);

    const notValidEvent: any = new CategoriesSyncEndedEvent(
      {
        id: 'test-id',
        isOk: true,
        nestor: { isNestor: true },
      },
      options,
    );
    notValidEvent.data.nestor = 123;

    this.eventBus.publish(notValidEvent);
  }
}
