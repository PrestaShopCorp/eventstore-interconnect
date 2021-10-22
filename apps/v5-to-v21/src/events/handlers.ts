import { CategoriesSyncEndedHandler } from './eventbus/categories-sync-ended.handler';
import { GoogleTaxonomiesSyncEndedHandler } from './eventbus/google-taxonomies-sync-ended.handler';
import { ProductsSyncEndedHandler } from './eventbus/products-sync-ended.handler';

export const EventHandlersEventbus = [
  CategoriesSyncEndedHandler,
  GoogleTaxonomiesSyncEndedHandler,
  ProductsSyncEndedHandler,
];
