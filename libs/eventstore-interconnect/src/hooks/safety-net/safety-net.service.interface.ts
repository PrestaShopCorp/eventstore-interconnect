export const SAFETY_NET = Symbol();

export interface SafetyNet {
  /**
   * This hook is triggered after the given timeout is given for an event writing, for every try.
   * @param event the event we want to write (will only be used for log in default strategy)
   */
  cannotWriteEventHook(event: any): void;

  /**
   * This hook is triggered after the detection of a non valid event.
   * @param event the event detected as invalid
   */
  invalidEventHook(event: any): void;
}
