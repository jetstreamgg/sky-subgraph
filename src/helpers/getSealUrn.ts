import { ZERO_ADDRESS } from './constants';

export async function getSealUrn(urnAddress: string, context: any) {
  const normalizedAddress = urnAddress.toLowerCase();
  let urn = await context.SealUrn.get(normalizedAddress);
  if (!urn) {
    urn = {
      id: normalizedAddress,
      owner: ZERO_ADDRESS,
      index: 0n,
      blockNumber: 0n,
      blockTimestamp: 0n,
      transactionHash: '0x',
      mkrLocked: 0n,
      usdsDebt: 0n,
      skyLocked: 0n,
      auctionsCount: 0n,
      voteDelegate_id: undefined,
      reward_id: undefined,
    };
  }
  return urn;
}
