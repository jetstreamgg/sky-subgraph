import {
    MkrToSky as MkrToSkyEventV2,
  } from '../generated/MkrSkyV2/MkrSkyV2';
  import {MkrToSkyUpgradeV2, Total } from '../generated/schema';
  import { BIGINT_ZERO } from './helpers/constants';
  
  export function handleMkrToSkyUpgradeV2(event: MkrToSkyEventV2): void {
    let entity = new MkrToSkyUpgradeV2(
      event.transaction.hash.concatI32(event.logIndex.toI32()),
    );
    entity.caller = event.params.caller;
    entity.usr = event.params.usr;
    entity.mkrAmt = event.params.mkrAmt;
    entity.skyAmt = event.params.skyAmt;
    entity.skyFee = event.params.skyFee;
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    entity.save();
  
    //add to running total of mkrUpgraded
    let totalMkrUpgraded = Total.load('mkrUpgraded');
    if (!totalMkrUpgraded) {
      totalMkrUpgraded = new Total('mkrUpgraded');
      totalMkrUpgraded.total = BIGINT_ZERO;
    }
    totalMkrUpgraded.total = totalMkrUpgraded.total.plus(entity.mkrAmt);
    totalMkrUpgraded.save();
  }