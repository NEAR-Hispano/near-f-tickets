import TokenMetadata from './TokenMetadata';

export default interface TokenSeriesJson {
  token_series_id: string;
  metadata: TokenMetadata;
  creator_id: string;
  is_mintable: boolean;
}
