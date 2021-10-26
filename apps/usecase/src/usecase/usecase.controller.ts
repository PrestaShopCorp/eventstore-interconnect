import { Controller, Get } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ProductsSyncEndedEvent } from '../events/eventbus/products-sync-ended.event';
import { EventOptionsType } from 'nestjs-geteventstore-legacy';

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
    };
    this.eventBus.publish(new ProductsSyncEndedEvent({}, options));
  }
}
