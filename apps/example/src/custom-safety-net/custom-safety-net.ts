import { SafetyNet } from '@eventstore-interconnect';

export default class CustomSafetyNet implements SafetyNet {
  public hook(event: any, eventWritten?: boolean): void {
    console.log('OVERRIDE SAFETY NET, DO NOTHING');
  }
}
