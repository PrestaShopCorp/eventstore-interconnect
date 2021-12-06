import { Module } from "@nestjs/common";
import { EventstoreInterconnectModule, InterconnectionConfiguration } from "@eventstore-interconnect";
import {
  legSrcLegDestConfiguration
} from "./configuration/eventstore-connections/legacy-src/legacy-dest/leg-src-leg-dest.configuration";
import {
  legSrcNextDestConfiguration
} from "./configuration/eventstore-connections/legacy-src/next-dest/leg-src-next-dest.configuration";
import {
  nextSrcNextDestConfiguration
} from "./configuration/eventstore-connections/next-src/next-dest/next-src-next-dest.configuration";
import {
  nextSrcLegDestConfiguration
} from "./configuration/eventstore-connections/next-src/legacy-dest/next-src-leg-dest.configuration";
import { CustomSafetyNet } from "./custom-safety-net/custom-safety-net";
import { Example1Event } from "./events/example1.event";
import { Example3Event } from "./events/example3.event";
import { Example2Event } from "./events/example2.event";
import { CustomWriterHookService } from "./custom-writer-hook/custom-writer-hook.service";

let configuration: InterconnectionConfiguration;

switch (process.env.CASE) {
  case "LEGLEG":
    configuration = legSrcLegDestConfiguration;
    break;
  case "LEGNEXT":
    configuration = legSrcNextDestConfiguration;
    break;
  case "NEXTLEG":
    configuration = nextSrcLegDestConfiguration;
    break;
  case "NEXTNEXT":
    configuration = nextSrcNextDestConfiguration;
    break;
}

const allowedEvents: any = {
  Example1Event,
  Example2Event,
  Example3Event
};

@Module({
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest(
      configuration,
      allowedEvents,
      {
        customSafetyNetStrategy: CustomSafetyNet,
        customWriterHook: CustomWriterHookService
      }
    )
  ]
})
export class UsecaseModule {
}
