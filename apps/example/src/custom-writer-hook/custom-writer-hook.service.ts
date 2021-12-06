import { Injectable } from "@nestjs/common";
import { WriterHook } from "@eventstore-interconnect/hooks/writer-hook/writer-hook";
import { FormattedEvent } from "@eventstore-interconnect";
import { Logger } from "nestjs-pino-stackdriver";

@Injectable()
export class CustomWriterHookService implements WriterHook{
  constructor(private readonly logger: Logger) {
  }

  public async hook(event: FormattedEvent): Promise<void> {
    this.logger.log("WriterHook : hooked while writing an event (could have write the event on third party)");
  }
}
