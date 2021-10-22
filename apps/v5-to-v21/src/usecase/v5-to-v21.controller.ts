import { Controller, Get } from '@nestjs/common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { ProductsSyncEndedEvent } from '../events/eventbus/products-sync-ended.event';

@Controller('/v5ToV21/')
export default class v5ToV21Controller {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  @Get('start')
  public async emitEvents(): Promise<void> {
    this.eventBus.publish(new ProductsSyncEndedEvent({}));
  }
}
