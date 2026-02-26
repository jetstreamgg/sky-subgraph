export async function getReward(rewardAddress: string, context: any) {
  const normalizedAddress = rewardAddress.toLowerCase();
  let reward = await context.Reward.get(normalizedAddress);
  if (!reward) {
    reward = {
      id: normalizedAddress,
      totalSupplied: 0n,
      totalRewardsClaimed: 0n,
      lockstakeActive: false,
      stakingEngineActive: false,
    };
  }
  return reward;
}
