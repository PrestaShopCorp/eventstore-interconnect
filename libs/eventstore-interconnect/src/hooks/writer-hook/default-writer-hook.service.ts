import { Injectable } from '@nestjs/common';
import { WriterHook } from './writer-hook';
import { FormattedEvent } from '../../formatter';

@Injectable()
export class DefaultWriterHookService implements WriterHook {
  public async hook(event: FormattedEvent): Promise<void> {
    // Do nothing
  }
}
