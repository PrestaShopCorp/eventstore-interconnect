import { Type } from '@nestjs/common';
import { SafetyNet } from './safety-net';
import { WriterHook } from './writer-hook/writer-hook';

export interface Hooks {
  customSafetyNetStrategy?: Type<SafetyNet>;
  customWriterHook?: Type<WriterHook>;
}
