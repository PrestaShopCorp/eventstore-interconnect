export const READER = Symbol();

export interface Reader {
  upsertPersistantSubscription();
}
