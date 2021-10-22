export interface FacebookSyncInterface {
  shopId: string;
  externalBusinessId: string;
  updatedAt?: Date;
  correlationId: string;
  batchId?: string;
  productsCount?: number;
  productsBatchIds?: Array<string>;
  jobId?: string;
  productIds?: Array<string>;
  firstProductSyncDate?: Date;
  lastProductSyncDate?: Date;
  localizationBatchDelay?: number;
  mainAttributeSelectionSupported?: boolean;
  attributesExported?: boolean;
  scannedBatchCount?: number;
  pendingBatchCount?: number;
  errorsCount?: number;
  errors?: any;
}
