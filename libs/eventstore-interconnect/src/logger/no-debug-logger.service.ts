import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NoDebugLoggerService extends Logger {
  public debug() {
    // do nothing
  }
}
