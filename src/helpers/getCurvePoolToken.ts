import { Address, BigInt, log } from '@graphprotocol/graph-ts';
import { CurveStableSwapNG } from '../../generated/CurveUsdsStUsdsPool/CurveStableSwapNG';

export function getCurvePoolToken(
  poolAddress: Address,
  tokenIndex: BigInt,
): Address {
  const curvePoolContract = CurveStableSwapNG.bind(poolAddress);
  const result = curvePoolContract.try_coins(tokenIndex);

  if (result.reverted) {
    log.warning('Failed to fetch token at index {} from pool {}', [
      tokenIndex.toString(),
      poolAddress.toHexString(),
    ]);
    return Address.zero();
  }

  return result.value;
}
