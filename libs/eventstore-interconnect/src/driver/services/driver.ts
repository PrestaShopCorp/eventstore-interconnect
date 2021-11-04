export const DRIVER = Symbol();

export interface Driver {
  writeEvent(event: any): Promise<any>;
}
