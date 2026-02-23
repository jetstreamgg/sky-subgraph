import { readCurvePoolCoin } from './contractCalls';

export async function getCurvePoolToken(
  chainId: number,
  poolAddress: string,
  tokenIndex: bigint,
): Promise<string> {
  return readCurvePoolCoin(chainId, poolAddress, tokenIndex);
}
