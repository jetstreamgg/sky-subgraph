import { readCurvePoolCoin } from './contractCalls.js';

export async function getCurvePoolToken(
  chainId: number,
  poolAddress: string,
  tokenIndex: bigint,
): Promise<string> {
  return readCurvePoolCoin(chainId, poolAddress, tokenIndex);
}
