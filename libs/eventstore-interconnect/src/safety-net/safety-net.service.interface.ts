export const SAFETY_NET = Symbol();

export interface SafetyNet {
  hook(event: any, eventWritten?: boolean): void;
}
