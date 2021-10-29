import { CategoriesSyncEndedHandler } from './categories-sync-ended.handler';
import { GoogleTaxonomiesSyncEndedHandler } from './google-taxonomies-sync-ended.handler';
import { ProductsSyncEndedHandler } from './products-sync-ended.handler';

export const EventHandlersEventbus = [
  CategoriesSyncEndedHandler,
  GoogleTaxonomiesSyncEndedHandler,
  ProductsSyncEndedHandler,
];
