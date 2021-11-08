import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  DriverModule,
  EventstoreInterconnectModule,
  InterconnectionConfiguration,
  isLegacyConf,
  SAFETY_NET,
} from '@eventstore-interconnect';
import UsecaseController from './usecase.controller';
import { legSrcLegDestConfiguration } from './configuration/eventstore-connections/legacy-src/legacy-dest/leg-src-leg-dest.configuration';
import { legSrcNextDestConfiguration } from './configuration/eventstore-connections/legacy-src/next-dest/leg-src-next-dest.configuration';
import { nextSrcNextDestConfiguration } from './configuration/eventstore-connections/next-src/next-dest/next-src-next-dest.configuration';
import { nextSrcLegDestConfiguration } from './configuration/eventstore-connections/next-src/legacy-dest/next-src-leg-dest.configuration';
import CustomSafetyNet from './custom-safety-net/custom-safety-net';
import { ES_GRPC_WRITER, ES_HTTP_WRITER } from './constants';
import { Example1Event } from './events/example1.event';
import { Example3Event } from './events/example3.event';
import { Example2Event } from './events/example2.event';

let configuration: InterconnectionConfiguration;

switch (process.env.CASE) {
  case 'LEGLEG':
    configuration = legSrcLegDestConfiguration;
    break;
  case 'LEGNEXT':
    configuration = legSrcNextDestConfiguration;
    break;
  case 'NEXTLEG':
    configuration = nextSrcLegDestConfiguration;
    break;
  case 'NEXTNEXT':
    configuration = nextSrcNextDestConfiguration;
    break;
}

const allowedEvents: any = {
  Example1Event,
  Example2Event,
  Example3Event,
};

@Module({
  controllers: [UsecaseController],
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest(
      configuration,
      allowedEvents,
    ),
    isLegacyConf(configuration.source)
      ? DriverModule.forLegacySrc(configuration.source) // Only for running this example, for writing on the src
      : DriverModule.forNextSrc(configuration.source),
  ],
  providers: [
    Logger,
    {
      provide: SAFETY_NET,
      useClass: CustomSafetyNet,
    },
    configuration !== nextSrcNextDestConfiguration
      ? DriverModule.getHttpDriverProvider(ES_HTTP_WRITER)
      : {
          provide: ES_HTTP_WRITER,
          useValue: {},
        },
    configuration !== legSrcLegDestConfiguration
      ? DriverModule.getGrpcDriverProvider(ES_GRPC_WRITER)
      : {
          provide: ES_GRPC_WRITER,
          useValue: {},
        },
  ],
})
export class UsecaseModule {}
