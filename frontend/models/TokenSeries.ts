import TokenMetada from './TokenMetadata';

export default interface TokenSeries {
  metadata: TokenMetada;
  creator_id: string;
  is_mintable: boolean;
  price: number;
}
