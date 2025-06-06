import { Delegate } from '../generated/schema';
import { Lock, Free } from '../generated/DSChiefV2/VoteDelegateV3';
import {
  delegationLockHandler,
  delegationFreeHandler,
} from './helpers/delegates';

export function handleDelegateLock(event: Lock): void {
  const sender = event.params.usr.toHexString();

  const delegateAddress = event.address;
  const delegate = Delegate.load(delegateAddress.toHexString());

  if (delegate) {
    //stake engine delegations are already handled in the lockstake engine handlers
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

export function handleDelegateFree(event: Free): void {
  const sender = event.params.usr.toHexString();

  const delegateAddress = event.address;
  const delegate = Delegate.load(delegateAddress.toHexString());

  if (delegate) {
    //stake engine delegations are already handled in the lockstake engine handlers
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
