import { IEventStoreEventOptions } from 'nestjs-geteventstore-1.6.4';

import { CategoriesSyncEndedEvent } from '../events/eventbus/categories-sync-ended.event';
import { GoogleTaxonomiesSyncEndedEvent } from '../events/eventbus/google-taxonomies-sync-ended.event';
import { ProductsSyncEndedEvent } from '../events/eventbus/products-sync-ended.event';

const eventsToMapEventbus = {
  CategoriesSyncEndedEvent: CategoriesSyncEndedEvent,
  GoogleTaxonomiesSyncEndedEvent: GoogleTaxonomiesSyncEndedEvent,
  ProductsSyncEndedEvent: ProductsSyncEndedEvent,
};

export const eventMapper = (data, options: IEventStoreEventOptions) => {
  console.log('Mapping for Eventbus ', options.eventType, '...');
  return eventsToMapEventbus[options.eventType]
    ? new eventsToMapEventbus[options.eventType](data, options)
    : null;
};
