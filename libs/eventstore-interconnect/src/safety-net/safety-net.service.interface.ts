export const SAFETY_NET = Symbol();

export interface SafetyNet {
  /**
   * This hook is triggered after the given timeout is given for an event writing, for every try.
   * @param event the event we want to write (will only be used for log in default strategy)
   * @param eventWritten indicates whether the event is effectively written or not. In the default strategy, if it is false whereas the hook is triggered, that means there is an issue, and the process is killed (aggressive timeout).
   */
  cannotWriteEventHook(event: any, eventWritten?: boolean): void;

  /**
   * This hook is triggered after the detection of a non valid event.
   * @param event the event detected as invalid
   */
  invalidEventHook(event: any): void;
}
