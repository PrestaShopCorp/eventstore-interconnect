import { Logger, Module } from '@nestjs/common';
import {
  EventstoreInterconnectModule,
  InterconnectionConfiguration,
} from '@eventstore-interconnect';
import usecaseController from './usecase.controller';
import { EventHandlersEventbus } from '../events/handlers';
import { legSrcLegDestConfiguration } from '../configuration/eventstore-connections/legacy-src/legacy-dest/leg-src-leg-dest.configuration';
import { legSrcNextDestConfiguration } from '../configuration/eventstore-connections/legacy-src/next-dest/leg-src-next-dest.configuration';
import { nextSrcNextDestConfiguration } from '../configuration/eventstore-connections/next-src/next-dest/next-src-next-dest.configuration';
import { nextSrcLegDestConfiguration } from '../configuration/eventstore-connections/next-src/legacy-dest/next-src-leg-dest.configuration';

// const projections: EventStoreProjectionType[] = [
//   {
//     name: 'hero-dragon2',
//     file: resolve(`apps/usecase/src/projections/hero-dragon.js`),
//     mode: 'continuous',
//     enabled: true,
//     checkPointsEnabled: true,
//     emitEnabled: true,
//   },
// ];

console.log('process.env.TOTO : ', process.env.TOTO);

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
  controllers: [usecaseController],
  imports: [EventstoreInterconnectModule.connectToSrcAndDest(configuration)],
  providers: [Logger, ...EventHandlersEventbus],
})
export class usecaseModule {}
