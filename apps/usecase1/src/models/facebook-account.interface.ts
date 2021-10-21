export interface AppAccessTokensInterface {
  longLived: any;
  system: any;
}

export interface FacebookAccountInterface {
  shopId?: string;
  externalBusinessId: string;
  webhookUrl: string;
  fbe?: any;
  appAccessTokens?: any;
  accountSuspended?: boolean;
  accountSuspensionReason?: string;
  accountCreatedAt: number;
  accountUpdatedAt: number;
}
