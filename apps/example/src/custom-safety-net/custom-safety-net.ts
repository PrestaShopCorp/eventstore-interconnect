import { SafetyNet } from '@eventstore-interconnect';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CustomSafetyNet implements SafetyNet {
  constructor(private readonly logger: Logger) {}

  public cannotWriteEventHook(event: any, eventWritten?: boolean): void {
    this.logger.log('OVERRIDE SAFETY NET, DO NOTHING');
  }

  public invalidEventHook(event: any): void {
    this.logger.log('INVALID EVENT DETECTED. CUSTOM ACTION : DO NOTHING');
  }
}
