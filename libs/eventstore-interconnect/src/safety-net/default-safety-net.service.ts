import { Inject, Injectable, Logger } from '@nestjs/common';
import { SafetyNet } from './safety-net.service.interface';
import { LOGGER } from '../logger';

@Injectable()
export class DefaultSafetyNetService implements SafetyNet {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

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
