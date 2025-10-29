import {
  Delegate,
  Delegation,
  DelegationHistory,
} from '../../../generated/schema';
import { BIGINT_ZERO } from '../../helpers/constants';
import { BigInt, ethereum } from '@graphprotocol/graph-ts';

export function isEngineAddress(address: string): boolean {
  const engineAddresses = [
    '0x2b16c07d5fd5cc701a0a871eae2aad6da5fc8f12', // LSE address
    '0xce01c90de7fd1bcfa39e237fe6d8d9f569e8a6a3', // Staking Engine address
  ];

  const addressLower = address.toLowerCase();
  for (let i = 0; i < engineAddresses.length; i++) {
    if (engineAddresses[i] === addressLower) {
      return true;
    }
  }
  return false;
}

export function delegationLockHandler(
  delegate: Delegate,
  address: string,
  amount: BigInt,
  block: ethereum.Block,
  transaction: ethereum.Transaction,
  isLockstake: boolean,
  isStakingEngine: boolean,
  logIndex: string,
): void {
  const delegation = getDelegation(delegate, address);

  // Update timestamp of the delegation
  delegation.timestamp = block.timestamp;

  // If previous delegation amount was 0, increment the delegators count
  if (delegation.amount.equals(BIGINT_ZERO)) {
    delegate.delegators = delegate.delegators + 1;
  }

  // Increase the total amount delegated to the delegate
  delegation.amount = delegation.amount.plus(amount);

  // Create a new delegation history entity
  const delegationHistoryId =
    delegation.id + '-' + block.number.toString() + '-' + logIndex;
  const delegationHistory = new DelegationHistory(delegationHistoryId);
  delegationHistory.delegator = delegation.delegator;
  delegationHistory.delegate = delegation.delegate;
  delegationHistory.amount = amount;
  delegationHistory.accumulatedAmount = delegation.amount;
  delegationHistory.blockNumber = block.number;
  delegationHistory.txnHash = transaction.hash.toHexString();
  delegationHistory.timestamp = block.timestamp;
  delegationHistory.isLockstake = isLockstake;
  delegationHistory.isStakingEngine = isStakingEngine;
  // Add the delegation history to the delegate
  delegate.delegationHistory = delegate.delegationHistory.concat([
    delegationHistoryId,
  ]);

  // Increase the total amount delegated to the delegate
  delegate.totalDelegated = delegate.totalDelegated.plus(amount);

  delegate.save();
  delegation.save();
  delegationHistory.save();
}

export function delegationFreeHandler(
  delegate: Delegate,
  address: string,
  amount: BigInt,
  block: ethereum.Block,
  transaction: ethereum.Transaction,
  isLockstake: boolean,
  isStakingEngine: boolean,
  logIndex: string,
): void {
  const delegation = getDelegation(delegate, address);

  // Update timestamp of the delegation
  delegation.timestamp = block.timestamp;

  // Decrease the total amount delegated to the delegate
  delegation.amount = delegation.amount.minus(amount);

  // If the delegation amount is 0, decrement the delegators count
  if (delegation.amount.equals(BIGINT_ZERO)) {
    delegate.delegators = delegate.delegators - 1;
  }

  // Create a new delegation history entity
  const delegationHistoryId =
    delegation.id + '-' + block.number.toString() + '-' + logIndex;
  const delegationHistory = new DelegationHistory(delegationHistoryId);
  delegationHistory.delegator = delegation.delegator;
  delegationHistory.delegate = delegation.delegate;
  // Amount is negative because it is a free event
  delegationHistory.amount = amount.times(BigInt.fromI64(-1));
  delegationHistory.accumulatedAmount = delegation.amount;
  delegationHistory.blockNumber = block.number;
  delegationHistory.txnHash = transaction.hash.toHexString();
  delegationHistory.timestamp = block.timestamp;
  delegationHistory.isLockstake = isLockstake;
  delegationHistory.isStakingEngine = isStakingEngine;
  // Add the delegation history to the delegate
  delegate.delegationHistory = delegate.delegationHistory.concat([
    delegationHistoryId,
  ]);

  // Decrease the total amount delegated to the delegate
  delegate.totalDelegated = delegate.totalDelegated.minus(amount);

  delegation.save();
  delegate.save();
  delegationHistory.save();
}

export function getDelegation(delegate: Delegate, address: string): Delegation {
  const delegationId = delegate.id + '-' + address;
  let delegation = Delegation.load(delegationId);
  if (!delegation) {
    delegation = new Delegation(delegationId);
    delegation.delegator = address;
    delegation.delegate = delegate.id;
    delegation.amount = BIGINT_ZERO;
    delegate.delegations = delegate.delegations.concat([delegationId]);
  }
  return delegation;
}

export function getDelegate(delegateAddress: string | null): Delegate | null {
  if (!delegateAddress) {
    return null;
  }
  let delegate = Delegate.load(delegateAddress as string);
  if (!delegate) {
    return null;
  }
  return delegate;
}
