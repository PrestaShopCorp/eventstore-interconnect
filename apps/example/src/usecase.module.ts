import { Module } from '@nestjs/common';
import { Logger } from 'nestjs-pino-stackdriver';
import {
  DriverModule,
  EventstoreInterconnectModule,
  InterconnectionConfiguration,
  SAFETY_NET,
} from '@eventstore-interconnect';
import UsecaseController from './usecase.controller';
import { legSrcLegDestConfiguration } from './configuration/eventstore-connections/legacy-src/legacy-dest/leg-src-leg-dest.configuration';
import { legSrcNextDestConfiguration } from './configuration/eventstore-connections/legacy-src/next-dest/leg-src-next-dest.configuration';
import { nextSrcNextDestConfiguration } from './configuration/eventstore-connections/next-src/next-dest/next-src-next-dest.configuration';
import { nextSrcLegDestConfiguration } from './configuration/eventstore-connections/next-src/legacy-dest/next-src-leg-dest.configuration';
import CustomSafetyNet from './custom-safety-net/custom-safety-net';
import { ES_GRPC_WRITER, ES_HTTP_WRITER } from './constants';

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

@Module({
  controllers: [UsecaseController],
  imports: [
    EventstoreInterconnectModule.connectToSrcAndDest(configuration),
    DriverModule.forLegacySrc(configuration), // Only for running this example, for writing on the src
  ],
  providers: [
    Logger,
    {
      provide: SAFETY_NET,
      useClass: CustomSafetyNet,
    },
    DriverModule.getHttpDriverProvider(ES_HTTP_WRITER),
    DriverModule.getGrpcDriverProvider(ES_GRPC_WRITER),
  ],
})
export class UsecaseModule {}
