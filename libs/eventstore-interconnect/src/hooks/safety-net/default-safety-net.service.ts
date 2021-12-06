import { Injectable, Logger } from '@nestjs/common';
import { SafetyNet } from './safety-net.service.interface';

@Injectable()
export class DefaultSafetyNetService implements SafetyNet {
  constructor(private readonly logger: Logger) {}

  public cannotWriteEventHook(event: any): void {
    this.logger.error(
      `Timeout while writing event (eventId ${event.eventId} and others after this one)`,
    );
    process.exit(1);
  }

  public invalidEventHook(): void {
    // Do nothing by default
  }
}
