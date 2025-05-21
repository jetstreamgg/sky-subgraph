import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { StakingUrn } from '../../generated/schema';
import { BIGINT_ZERO, ZERO_ADDRESS } from './constants';
import { StakingEngine } from '../../generated/StakingEngine/StakingEngine';

export function getStakingEngineUrn(urnAddress: Address): StakingUrn {
  let urn = StakingUrn.load(urnAddress);
  if (!urn) {
    urn = new StakingUrn(urnAddress);
    urn.owner = Address.fromString(ZERO_ADDRESS);
    urn.index = BIGINT_ZERO;
    urn.blockNumber = BIGINT_ZERO;
    urn.blockTimestamp = BIGINT_ZERO;
    urn.transactionHash = Bytes.empty();
    urn.usdsDebt = BIGINT_ZERO;
    urn.skyLocked = BIGINT_ZERO;
    urn.auctionsCount = BIGINT_ZERO;
    urn.save();
  }
  return urn;
}

export function getUrnAddress(
  stakingEngineContractAddress: Address,
  ownerAddress: Address,
  urnIndex: BigInt,
): Address {
  const stakingEngineContract = StakingEngine.bind(stakingEngineContractAddress);
  const urnAddress = stakingEngineContract.ownerUrns(ownerAddress, urnIndex);

  return urnAddress;
}
