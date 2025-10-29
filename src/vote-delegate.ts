import { Delegate } from '../generated/schema';
import { Lock, Free } from '../generated/DSChief/VoteDelegate';
import {
  delegationLockHandler,
  delegationFreeHandler,
  isEngineAddress,
} from './helpers/delegates';

export function handleDelegateLock(event: Lock): void {
  const sender = event.params.usr.toHexString();

  // Only process if sender is not a staking engine or LSE address
  if (!isEngineAddress(sender)) {
    const delegateAddress = event.address;
    const delegate = Delegate.load(delegateAddress.toHexString());

    if (delegate) {
      delegationLockHandler(
        delegate,
        sender,
        event.params.wad,
        event.block,
        event.transaction,
        false,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleDelegateFree(event: Free): void {
  const sender = event.params.usr.toHexString();

  // Only process if sender is not a staking engine or LSE address
  if (!isEngineAddress(sender)) {
    const delegateAddress = event.address;
    const delegate = Delegate.load(delegateAddress.toHexString());

    if (delegate) {
      delegationFreeHandler(
        delegate,
        sender,
        event.params.wad,
        event.block,
        event.transaction,
        false,
        false,
        event.logIndex.toString(),
      );
    }
  }
}
