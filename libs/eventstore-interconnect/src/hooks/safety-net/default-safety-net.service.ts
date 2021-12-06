import { Injectable } from "@nestjs/common";
import { Logger } from "nestjs-pino-stackdriver";
import { SafetyNet } from "./safety-net.service.interface";

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
