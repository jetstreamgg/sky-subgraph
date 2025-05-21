import {
  Open,
  SelectVoteDelegate,
  SelectFarm as SelectReward,
  AddFarm as AddReward,
  DelFarm as DelReward,
  Lock,
  LockSky,
  Free,
  FreeSky,
  FreeNoFee,
  Draw,
  Wipe,
  GetReward,
  OnKick,
  OnTake,
  OnRemove,
  Rely,
  Deny,
  Hope,
  Nope,
  // File as FileAddress,
  // File as FileUint,
} from '../generated/LockstakeEngine/LockstakeEngine';
import { MkrSky } from '../generated/MkrSky/MkrSky';
import {
  SealLock,
  SealLockSky,
  SealFree,
  SealFreeSky,
  SealFreeNoFee,
  SealSelectVoteDelegate,
  SealSelectReward,
  SealDraw,
  SealWipe,
  SealGetReward,
  SealOnKick,
  SealOnTake,
  SealOnRemove,
  SealRely,
  SealDeny,
  // SealFileAddress,
  // SealFileUint,
  SealHope,
  SealNope,
  Delegate,
  SealOpen,
} from '../generated/schema';
import { getSealUrn, getUrnAddress } from './helpers/getSealUrn';
import {
  getDelegate,
  delegationLockHandler,
  delegationFreeHandler,
} from './helpers/delegates';
import { getReward } from './helpers/getReward';
import { ZERO_ADDRESS } from './helpers/constants';
import { Address, BigInt, dataSource } from '@graphprotocol/graph-ts';

function getMkrSkyRate(): BigInt {
  const network = dataSource.network();
  // TODO: Update the addresses accordingly when available
  const MKR_SKY_CONTRACT_ADDRESS =
    network.toLowerCase() === 'mainnet'
      ? '0xBDcFCA946b6CDd965f99a839e4435Bcdc1bc470B' // Mainnet MKR-SKY contract address
      : '0xBDcFCA946b6CDd965f99a839e4435Bcdc1bc470B'; // Tenderly fork MKR-SKY contract address
  let mkrSkyContract = MkrSky.bind(
    Address.fromString(MKR_SKY_CONTRACT_ADDRESS),
  );
  return mkrSkyContract.rate();
}

export function handleSealOpen(event: Open): void {
  let urn = getSealUrn(event.params.urn);

  urn.owner = event.params.owner;
  urn.index = event.params.index;
  urn.blockNumber = event.block.number;
  urn.blockTimestamp = event.block.timestamp;
  urn.transactionHash = event.transaction.hash;

  urn.save();

  let open = new SealOpen(
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

export function handleSealSelectVoteDelegate(event: SelectVoteDelegate): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);

  const oldDelegateAddress = urn.voteDelegate;
  let oldDelegate: Delegate | null = null;
  if (oldDelegateAddress) {
    oldDelegate = getDelegate(oldDelegateAddress);
  }
  const newDelegateAddress = event.params.voteDelegate.toHexString();
  let newDelegate = getDelegate(newDelegateAddress);

  // if voteDelegate address is zero address, urn is undelegating
  if (newDelegateAddress == ZERO_ADDRESS) {
    let delegateEvent = new SealSelectVoteDelegate(
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
    if (oldDelegate && urn.mkrLocked.gt(BigInt.fromI32(0))) {
      delegationFreeHandler(
        oldDelegate,
        urn.owner.toHexString(),
        urn.mkrLocked,
        event.block,
        event.transaction,
        true,
        false,
        event.logIndex.toString(),
      );
    }
    return;
  } else {
    // delegate should always be found
    if (newDelegate) {
      let delegateEvent = new SealSelectVoteDelegate(
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
      if (oldDelegate && urn.mkrLocked.gt(BigInt.fromI32(0))) {
        delegationFreeHandler(
          oldDelegate,
          urn.owner.toHexString(),
          urn.mkrLocked,
          event.block,
          event.transaction,
          true,
          false,
          event.logIndex.toString(),
        );
      }
      if (urn.mkrLocked.gt(BigInt.fromI32(0))) {
        delegationLockHandler(
          newDelegate,
          urn.owner.toHexString(),
          urn.mkrLocked,
          event.block,
          event.transaction,
          true,
          false,
          event.logIndex.toString(),
        );
      }
    }
  }
}

export function handleSealSelectReward(event: SelectReward): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let reward = getReward(event.params.farm);

  let rewardEvent = new SealSelectReward(
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

export function handleSealAddReward(event: AddReward): void {
  let reward = getReward(event.params.farm);
  reward.lockstakeActive = true;
  reward.save();
}

export function handleSealDelReward(event: DelReward): void {
  let reward = getReward(event.params.farm);
  reward.lockstakeActive = false;
  reward.save();
}

export function handleSealLock(event: Lock): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let lock = new SealLock(
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

  urn.mkrLocked = urn.mkrLocked.plus(amount);
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
        true,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleSealLockSky(event: LockSky): void {
  const amount = event.params.skyWad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let lock = new SealLockSky(
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

  let rateMkrSky = getMkrSkyRate();

  urn.mkrLocked = urn.mkrLocked.plus(amount.div(rateMkrSky));
  urn.save();

  if (urn.voteDelegate && amount.gt(BigInt.fromI32(0))) {
    const delegate = getDelegate(urn.voteDelegate);
    if (delegate) {
      delegationLockHandler(
        delegate,
        urn.owner.toHexString(),
        amount.div(rateMkrSky),
        event.block,
        event.transaction,
        true,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleSealFree(event: Free): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let free = new SealFree(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  free.urn = urn.id;
  free.index = event.params.index;
  free.to = event.params.to;
  free.wad = amount;
  free.freed = event.params.freed;
  free.blockNumber = event.block.number;
  free.blockTimestamp = event.block.timestamp;
  free.transactionHash = event.transaction.hash;
  free.save();

  urn.mkrLocked = urn.mkrLocked.minus(amount);
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
        true,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleSealFreeSky(event: FreeSky): void {
  const amount = event.params.skyWad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let free = new SealFreeSky(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  free.urn = urn.id;
  free.index = event.params.index;
  free.to = event.params.to;
  free.skyWad = amount;
  free.skyFreed = event.params.skyFreed;
  free.blockNumber = event.block.number;
  free.blockTimestamp = event.block.timestamp;
  free.transactionHash = event.transaction.hash;
  free.save();

  let rateMkrSky = getMkrSkyRate();

  urn.mkrLocked = urn.mkrLocked.minus(amount.div(rateMkrSky));
  urn.save();

  if (urn.voteDelegate && amount.gt(BigInt.fromI32(0))) {
    const delegate = getDelegate(urn.voteDelegate);
    if (delegate) {
      delegationFreeHandler(
        delegate,
        urn.owner.toHexString(),
        amount.div(rateMkrSky),
        event.block,
        event.transaction,
        true,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleSealFreeNoFee(event: FreeNoFee): void {
  const amount = event.params.wad;
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let free = new SealFreeNoFee(
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

  urn.mkrLocked = urn.mkrLocked.minus(amount);
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
        true,
        false,
        event.logIndex.toString(),
      );
    }
  }
}

export function handleSealDraw(event: Draw): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let draw = new SealDraw(
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

export function handleSealWipe(event: Wipe): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let wipe = new SealWipe(
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

export function handleSealGetReward(event: GetReward): void {
  const urnAddress = getUrnAddress(
    event.address,
    event.params.owner,
    event.params.index,
  );
  let urn = getSealUrn(urnAddress);
  let reward = new SealGetReward(
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

export function handleSealOnKick(event: OnKick): void {
  let urn = getSealUrn(event.params.urn);
  let kick = new SealOnKick(
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

export function handleSealOnTake(event: OnTake): void {
  let urn = getSealUrn(event.params.urn);
  let take = new SealOnTake(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  take.urn = urn.id;
  take.who = event.params.who;
  take.wad = event.params.wad;
  take.blockNumber = event.block.number;
  take.blockTimestamp = event.block.timestamp;
  take.transactionHash = event.transaction.hash;
  take.save();
}

export function handleSealOnRemove(event: OnRemove): void {
  let urn = getSealUrn(event.params.urn);
  let remove = new SealOnRemove(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  remove.urn = urn.id;
  remove.sold = event.params.sold;
  // remove.left = event.params.left;
  remove.blockNumber = event.block.number;
  remove.blockTimestamp = event.block.timestamp;
  remove.transactionHash = event.transaction.hash;
  remove.save();

  urn.auctionsCount = urn.auctionsCount.minus(BigInt.fromI32(1));
  urn.save();
}

export function handleSealRely(event: Rely): void {
  let entity = new SealRely(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleSealDeny(event: Deny): void {
  let entity = new SealDeny(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

// export function handleSealFileAddress(event: FileAddress): void {
//   let entity = new SealFileAddress(
//     event.transaction.hash
//       .toHex()
//       .concat('-')
//       .concat(event.logIndex.toString()),
//   );
//   entity.what = event.params.what;
//   entity.data = event.params.data;
//   entity.blockNumber = event.block.number;
//   entity.blockTimestamp = event.block.timestamp;
//   entity.transactionHash = event.transaction.hash;
//   entity.save();
// }

// export function handleSealFileUint(event: FileUint): void {
//   let entity = new SealFileUint(
//     event.transaction.hash
//       .toHex()
//       .concat('-')
//       .concat(event.logIndex.toString()),
//   );
//   entity.what = event.params.what;
//   entity.data = event.params.data;
//   entity.blockNumber = event.block.number;
//   entity.blockTimestamp = event.block.timestamp;
//   entity.transactionHash = event.transaction.hash;
//   entity.save();
// }

export function handleSealHope(event: Hope): void {
  let entity = new SealHope(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  entity.owner = event.params.owner;
  entity.index = event.params.index;
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}

export function handleSealNope(event: Nope): void {
  let entity = new SealNope(
    event.transaction.hash
      .toHex()
      .concat('-')
      .concat(event.logIndex.toString()),
  );
  entity.owner = event.params.owner;
  entity.index = event.params.index;
  entity.usr = event.params.usr;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}
