import { Controller, Get } from '@nestjs/common';
import { WriteEventBus } from 'nestjs-geteventstore-legacy';
import { CategoriesSyncEndedEvent } from './events/eventbus/categories-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from './events/eventbus/google-taxonomies-sync-ended.event';
import { ProductsSyncEndedEvent } from './events/eventbus/products-sync-ended.event';

@Controller('/usecase1/')
export default class Usecase1Controller {
  constructor(private readonly writeEventBus: WriteEventBus) {}

  @Get('emit')
  public emitEvents(): Promise<void> {
    return this.writeEventBus.publishAll([
      new CategoriesSyncEndedEvent({}),
      new GoogleTaxonomiesSyncEndedEvent({}),
      new ProductsSyncEndedEvent({}),
    ]);
  }
}
