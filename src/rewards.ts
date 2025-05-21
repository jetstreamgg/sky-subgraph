import {
  RewardPaid as RewardClaimEvent,
  Staked as RewardSupplyEvent,
  Withdrawn as RewardWithdrawEvent,
  Referral as ReferralEvent,
} from '../generated/RewardsUsdsSky/RewardsUsdsSky';

import {
  RewardClaim,
  RewardSupply,
  TvlUpdate,
  RewardWithdraw,
  RewardReferral,
} from '../generated/schema';
import { getReward } from './helpers/getReward';
import { getRewardSupplier } from './helpers/getRewardSupplier';

export function handleRewardClaimed(event: RewardClaimEvent): void {
  const reward = getReward(event.address);

  let entity = new RewardClaim(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  entity.user = event.params.user;
  entity.amount = event.params.reward;
  entity.reward = reward.id;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  reward.totalRewardsClaimed = reward.totalRewardsClaimed.plus(
    event.params.reward,
  );
  reward.save();
}

export function handleRewardSupplied(event: RewardSupplyEvent): void {
  const reward = getReward(event.address);

  let entity = new RewardSupply(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  entity.user = event.params.user;
  entity.amount = event.params.amount;
  entity.reward = reward.id;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Update supplier
  const supplier = getRewardSupplier(reward.id, event.params.user);
  supplier.amount = supplier.amount.plus(event.params.amount);
  supplier.save();

  // Update reward
  reward.totalSupplied = reward.totalSupplied.plus(event.params.amount);
  reward.save();

  // Add new TVL event
  const tvl = new TvlUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  tvl.reward = reward.id;
  tvl.amount = reward.totalSupplied;
  tvl.blockNumber = event.block.number;
  tvl.blockTimestamp = event.block.timestamp;
  tvl.transactionHash = event.transaction.hash;
  tvl.save();
}

export function handleRewardWithdrawn(event: RewardWithdrawEvent): void {
  const reward = getReward(event.address);

  let entity = new RewardWithdraw(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );

  entity.user = event.params.user;
  entity.amount = event.params.amount;
  entity.reward = reward.id;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  // Update supplier
  const supplier = getRewardSupplier(reward.id, event.params.user);
  supplier.amount = supplier.amount.minus(event.params.amount);
  supplier.save();

  // Update reward
  reward.totalSupplied = reward.totalSupplied.minus(event.params.amount);
  reward.save();

  // Add new TVL event
  const tvl = new TvlUpdate(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  tvl.reward = reward.id;
  tvl.amount = reward.totalSupplied;
  tvl.blockNumber = event.block.number;
  tvl.blockTimestamp = event.block.timestamp;
  tvl.transactionHash = event.transaction.hash;
  tvl.save();
}

export function handleRewardReferral(event: ReferralEvent): void {
  const reward = getReward(event.address);

  let entity = new RewardReferral(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  );
  let ref = event.params.referral;
  if (!ref) {
    ref = 0;
  }
  entity.referral = ref;
  entity.reward = reward.id;
  entity.user = event.params.user;
  entity.amount = event.params.amount;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
