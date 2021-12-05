export const READER = Symbol();

export interface Reader {
  upsertPersistantSubscriptions();
}
