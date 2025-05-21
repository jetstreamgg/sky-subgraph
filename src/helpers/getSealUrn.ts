import { Address, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { SealUrn } from '../../generated/schema';
import { BIGINT_ZERO, ZERO_ADDRESS } from './constants';
import { LockstakeEngine } from '../../generated/LockstakeEngine/LockstakeEngine';

export function getSealUrn(urnAddress: Address): SealUrn {
  let urn = SealUrn.load(urnAddress);
  if (!urn) {
    urn = new SealUrn(urnAddress);
    urn.owner = Address.fromString(ZERO_ADDRESS);
    urn.index = BIGINT_ZERO;
    urn.blockNumber = BIGINT_ZERO;
    urn.blockTimestamp = BIGINT_ZERO;
    urn.transactionHash = Bytes.empty();
    urn.mkrLocked = BIGINT_ZERO;
    urn.usdsDebt = BIGINT_ZERO;
    urn.skyLocked = BIGINT_ZERO;
    urn.auctionsCount = BIGINT_ZERO;
    urn.save();
  }
  return urn;
}

export function getUrnAddress(
  sealContractAddress: Address,
  ownerAddress: Address,
  urnIndex: BigInt,
): Address {
  const sealContract = LockstakeEngine.bind(sealContractAddress);
  const urnAddress = sealContract.ownerUrns(ownerAddress, urnIndex);

  return urnAddress;
}
