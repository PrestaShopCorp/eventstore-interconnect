export const VALIDATOR = Symbol();

export interface Validator {
  validate(event: any);
}
