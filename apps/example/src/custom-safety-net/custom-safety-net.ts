import { SafetyNet } from '@eventstore-interconnect';
import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';

@Injectable()
export class CustomSafetyNet implements SafetyNet {
  constructor(private readonly logger: Logger) {}
  public hook(event: any, eventWritten?: boolean): void {
    this.logger.log('OVERRIDE SAFETY NET, DO NOTHING');
  }
}
