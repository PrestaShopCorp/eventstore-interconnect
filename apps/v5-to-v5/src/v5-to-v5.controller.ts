import { Controller, Get } from '@nestjs/common';
import { WriteEventBus } from 'nestjs-geteventstore-legacy';
import { CategoriesSyncEndedEvent } from './events/eventbus/categories-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from './events/eventbus/google-taxonomies-sync-ended.event';
import { ProductsSyncEndedEvent } from './events/eventbus/products-sync-ended.event';

@Controller('/v5ToV5/')
export default class v5ToV5Controller {
  constructor(private readonly writeEventBus: WriteEventBus) {}

  @Get('start')
  public emitEvents(): Promise<void> {
    return this.writeEventBus.publishAll([
      new CategoriesSyncEndedEvent({}),
      new GoogleTaxonomiesSyncEndedEvent({}),
      new ProductsSyncEndedEvent({}),
    ]);
  }
}
