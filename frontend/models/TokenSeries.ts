import TokenMetada from './TokenMetadata';

export default interface TokenSeries {
  metadata: TokenMetada;
  creator_id: string;
  // tokens:
  is_mintable: boolean;
  // royalty:
}
