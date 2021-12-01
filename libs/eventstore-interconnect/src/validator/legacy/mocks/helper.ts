import { ResolvedEvent } from 'node-eventstore-client';

export const getEvent = (valid: boolean, version: number): any => {
  return {
    event: {
      eventStreamId: '$ce-hero',
      eventId: 'f549ad78-0487-48f2-9a19-2b508970b9e5',
      eventNumber: { low: 91, high: 0, unsigned: false },
      eventType: `Dumb${version}Event`,
      created: '2021-11-05T10:45:01.047Z',
      createdEpoch: 1636109101047,
      data: Buffer.from(
        JSON.stringify({
          id: 'test-id',
          isOk: true,
          nestor: { isNestor: valid ? false : 123 },
        }),
      ),
      metadata: Buffer.from(
        JSON.stringify({
          correlation_id: 'fff',
          version: 123,
          type: 'int.e',
          source: 'bla',
          time: new Date().toISOString(),
          specversion: 1,
        }),
      ),
      isJson: true,
    },
    link: null,
    originalEvent: {
      eventStreamId: '$ce-hero',
      eventId: 'f549ad78-0487-48f2-9a19-2b508970b9e5',
      eventNumber: { low: 91, high: 0, unsigned: false },
      eventType: `Dumb${version}Event`,
      created: '2021-11-05T10:45:01.047Z',
      createdEpoch: 1636109101047,
      data: Buffer.from(
        JSON.stringify({
          id: 'test-id',
          isOk: true,
          nestor: { isNestor: valid ? false : 123 },
        }),
      ),
      metadata: Buffer.from(
        JSON.stringify({
          correlation_id: 'fff',
          version: 123,
          type: 'int.e',
          source: 'bla',
          time: new Date().toISOString(),
          specversion: 1,
        }),
      ),
      isJson: true,
    },
    isResolved: false,
    originalPosition: null,
    originalStreamId: '$ce-hero',
    originalEventNumber: { low: 91, high: 0, unsigned: false },
  } as any as ResolvedEvent;
};
