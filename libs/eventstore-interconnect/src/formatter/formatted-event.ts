export interface FormattedEvent {
  data: any;
  metadata: FormattedMetadata;
}
export interface FormattedMetadata {
  eventStreamId: string;
  eventType: string;
  eventId: string;
}
