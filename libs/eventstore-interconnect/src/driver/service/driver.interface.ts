export const DRIVER = Symbol();

export interface Driver {
  writeEvent(
    eventStreamId: string,
    eventType: string,
    data: any,
    metadata: any,
  );
}
