//TODO: continue updating this file, its currently mostly a copy paste of seal.ts

import {
  Open,
  SelectVoteDelegate,
  SelectFarm as SelectReward,
  Lock,
  Free,
  FreeNoFee,
  Draw,
  Wipe,
  GetReward,
  OnKick,
  AddFarm as AddReward,
  DelFarm as DelReward,
} from '../generated/StakingEngine/StakingEngine';
import {
  StakingLock,
  StakingFree,
  StakingFreeNoFee,
  StakingSelectVoteDelegate,
  StakingSelectReward,
  StakingDraw,
  StakingWipe,
  StakingGetReward,
  StakingOnKick,
  StakingOpen,
  Delegate,
} from '../generated/schema';
import {
  getStakingEngineUrn,
  getUrnAddress,
} from './helpers/getStakingEngineUrn';
import {
  getDelegate,
  delegationLockHandler,
  delegationFreeHandler,
} from './helpers/delegates';
import { getReward } from './helpers/getReward';
import { ZERO_ADDRESS } from './helpers/constants';
import { BigInt } from '@graphprotocol/graph-ts';

export function handleStakingOpen(event: Open): void {
  let urn = getStakingEngineUrn(event.params.urn);

  urn.owner = event.params.owner;
  urn.index = event.params.index;
  urn.blockNumber = event.block.number;
  urn.blockTimestamp = event.block.timestamp;
  urn.transactionHash = event.transaction.hash;

  urn.save();

  let open = new StakingOpen(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );

  open.owner = event.params.owner;
  open.index = event.params.index;
  open.urn = event.params.urn;
  open.blockNumber = event.block.number;
  open.blockTimestamp = event.block.timestamp;
  open.transactionHash = event.transaction.hash;

  open.save();
}

export function handleStakingSelectVoteDelegate(
  event: SelectVoteDelegate,
): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);

  const oldDelegateAddress = urn.voteDelegate;
  let oldDelegate: Delegate | null = null;
  if (oldDelegateAddress) {
    oldDelegate = getDelegate(oldDelegateAddress);
  }
  const newDelegateAddress = event.params.voteDelegate.toHexString();
  let newDelegate = getDelegate(newDelegateAddress);

  // if voteDelegate address is zero address, urn is undelegating
  if (newDelegateAddress == ZERO_ADDRESS) {
    let delegateEvent = new StakingSelectVoteDelegate(
      event.transaction.hash
        .toHex()
        .concat('-')
        .concat(event.logIndex.toString()),
    );
    delegateEvent.urn = urn.id;
    delegateEvent.index = event.params.index;
    delegateEvent.voteDelegate = null;
    delegateEvent.blockNumber = event.block.number;
    delegateEvent.blockTimestamp = event.block.timestamp;
    delegateEvent.transactionHash = event.transaction.hash;
    delegateEvent.save();

    urn.voteDelegate = null;
    urn.save();

    //handle delegation free
    if (oldDelegate && urn.skyLocked.gt(BigInt.fromI32(0))) {
      delegationFreeHandler(
        oldDelegate,
        urn.owner.toHexString(),
        urn.skyLocked,
        event.block,
        event.transaction,
        false,
        true,
        event.logIndex.toString(),
      );
    }
    return;
  } else {
    // delegate should always be found
    if (newDelegate) {
      let delegateEvent = new StakingSelectVoteDelegate(
        event.transaction.hash
          .toHex()
          .concat('-')
          .concat(event.logIndex.toString()),
      );
      delegateEvent.urn = urn.id;
      delegateEvent.index = event.params.index;
      delegateEvent.voteDelegate = newDelegate.id;
      delegateEvent.blockNumber = event.block.number;
      delegateEvent.blockTimestamp = event.block.timestamp;
      delegateEvent.transactionHash = event.transaction.hash;
      delegateEvent.save();

      urn.voteDelegate = newDelegate.id;
      urn.save();

      //handle delegation change
      if (oldDelegate && urn.skyLocked.gt(BigInt.fromI32(0))) {
        delegationFreeHandler(
          oldDelegate,
          urn.owner.toHexString(),
          urn.skyLocked,
          event.block,
          event.transaction,
          false,
          true,
          event.logIndex.toString(),
        );
      }
      if (urn.skyLocked.gt(BigInt.fromI32(0))) {
        delegationLockHandler(
          newDelegate,
          urn.owner.toHexString(),
          urn.skyLocked,
          event.block,
          event.transaction,
          false,
          true,
          event.logIndex.toString(),
        );
      }
    }
  }
}

export function handleStakingSelectReward(event: SelectReward): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let reward = getReward(event.params.farm);

  let rewardEvent = new StakingSelectReward(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  rewardEvent.urn = urn.id;
  rewardEvent.index = event.params.index;
  rewardEvent.reward = reward.id;
  let ref = event.params.ref;
  if (!ref) {
    ref = 0;
  }
  rewardEvent.ref = ref;
  rewardEvent.blockNumber = event.block.number;
  rewardEvent.blockTimestamp = event.block.timestamp;
  rewardEvent.transactionHash = event.transaction.hash;
  rewardEvent.save();

  urn.reward = reward.id;
  urn.save();
}

export function handleStakingLock(event: Lock): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let lock = new StakingLock(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  lock.urn = urn.id;
  lock.index = event.params.index;
  lock.wad = amount;
  let ref = event.params.ref;
  if (!ref) {
    ref = 0;
  }
  lock.ref = ref;
  lock.blockNumber = event.block.number;
  lock.blockTimestamp = event.block.timestamp;
  lock.transactionHash = event.transaction.hash;
  lock.save();

  urn.skyLocked = urn.skyLocked.plus(amount);
  urn.save();

  if (urn.voteDelegate && amount.gt(BigInt.fromI32(0))) {
    const delegate = getDelegate(urn.voteDelegate);
    if (delegate) {
      delegationLockHandler(
        delegate,
        urn.owner.toHexString(),
        amount,
        event.block,
        event.transaction,
        false,
        true,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleStakingFree(event: Free): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let free = new StakingFree(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  free.urn = urn.id;
  free.index = event.params.index;
  free.to = event.params.to;
  free.wad = amount;
  free.blockNumber = event.block.number;
  free.blockTimestamp = event.block.timestamp;
  free.transactionHash = event.transaction.hash;
  free.save();

  urn.skyLocked = urn.skyLocked.minus(amount);
  urn.save();

  if (urn.voteDelegate && amount.gt(BigInt.fromI32(0))) {
    const delegate = getDelegate(urn.voteDelegate);
    if (delegate) {
      delegationFreeHandler(
        delegate,
        urn.owner.toHexString(),
        amount,
        event.block,
        event.transaction,
        false,
        true,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleStakingFreeNoFee(event: FreeNoFee): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let free = new StakingFreeNoFee(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  free.urn = urn.id;
  free.index = event.params.index;
  free.to = event.params.to;
  free.wad = amount;
  free.blockNumber = event.block.number;
  free.blockTimestamp = event.block.timestamp;
  free.transactionHash = event.transaction.hash;
  free.save();

  urn.skyLocked = urn.skyLocked.minus(amount);
  urn.save();

  if (urn.voteDelegate && amount.gt(BigInt.fromI32(0))) {
    const delegate = getDelegate(urn.voteDelegate);
    if (delegate) {
      delegationFreeHandler(
        delegate,
        urn.owner.toHexString(),
        amount,
        event.block,
        event.transaction,
        false,
        true,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleStakingDraw(event: Draw): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let draw = new StakingDraw(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  draw.urn = urn.id;
  draw.index = event.params.index;
  draw.to = event.params.to;
  draw.wad = event.params.wad;
  draw.blockNumber = event.block.number;
  draw.blockTimestamp = event.block.timestamp;
  draw.transactionHash = event.transaction.hash;
  draw.save();

  urn.usdsDebt = urn.usdsDebt.plus(event.params.wad);
  urn.save();
}

export function handleStakingWipe(event: Wipe): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let wipe = new StakingWipe(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  wipe.urn = urn.id;
  wipe.index = event.params.index;
  wipe.wad = event.params.wad;
  wipe.blockNumber = event.block.number;
  wipe.blockTimestamp = event.block.timestamp;
  wipe.transactionHash = event.transaction.hash;
  wipe.save();

  urn.usdsDebt = urn.usdsDebt.minus(event.params.wad);
  urn.save();
}

export function handleStakingGetReward(event: GetReward): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getStakingEngineUrn(urnAddress);
  let reward = new StakingGetReward(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  reward.urn = urn.id;
  reward.index = event.params.index;
  reward.reward = event.params.farm;
  reward.to = event.params.to;
  reward.amt = event.params.amt;
  reward.blockNumber = event.block.number;
  reward.blockTimestamp = event.block.timestamp;
  reward.transactionHash = event.transaction.hash;
  reward.save();
}

export function handleStakingOnKick(event: OnKick): void {
  let urn = getStakingEngineUrn(event.params.urn);
  let kick = new StakingOnKick(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  kick.urn = urn.id;
  kick.wad = event.params.wad;
  kick.blockNumber = event.block.number;
  kick.blockTimestamp = event.block.timestamp;
  kick.transactionHash = event.transaction.hash;
  kick.save();

  urn.auctionsCount = urn.auctionsCount.plus(BigInt.fromI32(1));
  urn.save();
}

export function handleStakingAddReward(event: AddReward): void {
  let reward = getReward(event.params.farm);
  reward.stakingEngineActive = true;
  reward.save();
}

export function handleStakingDelReward(event: DelReward): void {
  let reward = getReward(event.params.farm);
  reward.stakingEngineActive = false;
  reward.save();
}
