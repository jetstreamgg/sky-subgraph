import {
    LockstakeMigrate,
  } from '../generated/schema';
import {
    Migrate as LockstakeMigrateEvent,
  } from '../generated/LockstakeMigrator/LockstakeMigrator';

  export function handleLockstakeMigrate(event: LockstakeMigrateEvent): void {
    let entity = new LockstakeMigrate(
      event.transaction.hash.concatI32(event.logIndex.toI32()),
    );
    entity.oldOwner = event.params.oldOwner;
    entity.oldIndex = event.params.oldIndex;
    entity.newOwner = event.params.newOwner;
    entity.newIndex = event.params.newIndex;
    entity.ink = event.params.ink;
    entity.debt = event.params.debt;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  }
