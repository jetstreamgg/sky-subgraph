import { Reward } from '../../generated/schema';
import { BigInt, Address } from '@graphprotocol/graph-ts';

export function getReward(rewardAddress: Address): Reward {
  let reward = Reward.load(rewardAddress);
  if (reward === null) {
    reward = new Reward(rewardAddress);
    reward.totalSupplied = BigInt.fromI32(0);
    reward.totalRewardsClaimed = BigInt.fromI32(0);
    reward.lockstakeActive = false;
    reward.stakingEngineActive = false;
    reward.save();
  }
  return reward as Reward;
}
