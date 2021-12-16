import { IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ValidableMetadatasDto {
  constructor(metadata: ValidableMetadatasDto) {
    return Object.assign(this, metadata);
  }

  @IsBoolean()
  isOk: boolean;
}

export class ValidableMetadataEvent {
  @ValidateNested()
  @Type(() => ValidableMetadatasDto)
  public metadata: ValidableMetadatasDto;
  private data: any;

  constructor(data: any, metadata?: ValidableMetadatasDto) {
    this.data = data;
    this.metadata = new ValidableMetadatasDto(metadata);
  }
}
