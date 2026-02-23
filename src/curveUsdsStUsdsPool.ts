import { CurveUsdsStUsdsPool } from 'generated';
import { getCurvePoolToken } from './helpers/getCurvePoolToken.js';

CurveUsdsStUsdsPool.TokenExchange.handler(async ({ event, context }) => {
  const entityId = `${event.transaction.hash}-${event.logIndex}`;

  const soldTokenAddress = await getCurvePoolToken(
    event.chainId,
    event.srcAddress,
    event.params.sold_id,
  );
  const boughtTokenAddress = await getCurvePoolToken(
    event.chainId,
    event.srcAddress,
    event.params.bought_id,
  );

  context.CurveTokenExchange.set({
    id: entityId,
    buyer: event.params.buyer,
    soldId: event.params.sold_id,
    amountSold: event.params.tokens_sold,
    boughtId: event.params.bought_id,
    amountBought: event.params.tokens_bought,
    blockNumber: BigInt(event.block.number),
    blockTimestamp: BigInt(event.block.timestamp),
    transactionHash: event.transaction.hash,
    soldTokenAddress,
    boughtTokenAddress,
  });
});
