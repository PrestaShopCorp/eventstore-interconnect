import { Module } from '@nestjs/common';
import { EventstoreInterconnectService } from './eventstore-interconnect.service';

@Module({
  providers: [EventstoreInterconnectService],
  exports: [EventstoreInterconnectService],
})
export class EventstoreInterconnectModule {}
