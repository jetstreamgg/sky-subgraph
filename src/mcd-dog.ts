import { Bark as BarkEvent } from '../generated/McdDog/McdDog';
import { Bark, SealUrn, StakingUrn } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts';

export function handleBark(event: BarkEvent): void {
  let barkId = event.params.ilk.toHex() + '-' + event.params.id.toString();
  let bark = new Bark(barkId);

  bark.ilk = event.params.ilk;
  bark.urn = event.params.urn;
  bark.ink = event.params.ink;
  bark.art = event.params.art;
  bark.due = event.params.due;
  bark.clip = event.params.clip;
  bark.clipperId = event.params.id;
  bark.blockNumber = event.block.number;
  bark.blockTimestamp = event.block.timestamp;
  bark.transactionHash = event.transaction.hash;

  // Attempt to load existing SealUrn
  let urnAddress = event.params.urn;
  let sealUrn = SealUrn.load(urnAddress);

  if (sealUrn != null) {
    bark.sealUrn = sealUrn.id;
    log.info('Bark event linked to existing SealUrn: {}', [
      urnAddress.toHexString(),
    ]);
  } else {
    log.info('No existing SealUrn found for Bark event: {}', [
      urnAddress.toHexString(),
    ]);
  }

  // Attempt to load existing StakingUrn
  let stakingUrn = StakingUrn.load(urnAddress);

  if (stakingUrn != null) {
    bark.stakingUrn = stakingUrn.id;
    log.info('Bark event linked to existing StakingUrn: {}', [
      urnAddress.toHexString(),
    ]);
  } else {
    log.info('No existing StakingUrn found for Bark event: {}', [
      urnAddress.toHexString(),
    ]);
  }

  // Save Bark entity
  bark.save();
}
