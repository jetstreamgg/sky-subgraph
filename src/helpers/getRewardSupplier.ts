import { BigInt, Bytes } from '@graphprotocol/graph-ts';
import { RewardSupplier } from '../../generated/schema';

export function getRewardSupplier(
  rewardId: Bytes,
  userId: Bytes,
): RewardSupplier {
  // Concatenate Bytes for a unique ID
  const rewardSupplierId = rewardId.concat(userId);

  let supplier = RewardSupplier.load(rewardSupplierId);

  if (supplier === null) {
    supplier = new RewardSupplier(rewardSupplierId);
    supplier.reward = rewardId;
    supplier.user = userId;
    supplier.amount = BigInt.fromI32(0);
    supplier.save();
  }

  return supplier;
}
