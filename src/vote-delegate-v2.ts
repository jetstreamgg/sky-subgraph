import { Delegate } from '../generated/schema';
import { Lock, Free, ReserveHatch } from '../generated/DSChief/VoteDelegateV2';
import {
  delegationLockHandler,
  delegationFreeHandler,
} from './helpers/delegates';

export function handleDelegateLock(event: Lock): void {
  const sender = event.params.usr.toHexString();

  const delegateAddress = event.address;
  const delegate = Delegate.load(delegateAddress.toHexString());

  if (delegate) {
    //lockstake engine delegations are already handled in the lockstake engine handlers
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
    //lockstake engine delegations are already handled in the lockstake engine handlers
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

export function handleReserveHatch(event: ReserveHatch): void {
  // Implement the logic for handling the ReserveHatch event
  // This is a placeholder function and should be updated with actual logic
  // based on the requirements of the ReserveHatch event.
}
