import { Address, BigInt } from '@graphprotocol/graph-ts';
import { CurveStableSwapNG } from '../../generated/CurveUsdsStUsdsPool/CurveStableSwapNG';

export function getCurvePoolToken(
  poolAddress: Address,
  tokenIndex: BigInt,
): Address {
  const curvePoolContract = CurveStableSwapNG.bind(poolAddress);
  const tokenAddress = curvePoolContract.coins(tokenIndex);

  return tokenAddress;
}
