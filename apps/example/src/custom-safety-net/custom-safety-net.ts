import { SafetyNet } from '@eventstore-interconnect';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { LOGGER } from '@eventstore-interconnect';

@Injectable()
export class CustomSafetyNet implements SafetyNet {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  public cannotWriteEventHook(event: any, eventWritten?: boolean): void {
    this.logger.log('OVERRIDE SAFETY NET, DO NOTHING');
  }

  public invalidEventHook(event: any): void {
    this.logger.log('INVALID EVENT DETECTED. CUSTOM ACTION : DO NOTHING');
  }
}
