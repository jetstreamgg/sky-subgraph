import { CurveUsdsStUsdsPool } from "generated";

CurveUsdsStUsdsPool.TokenExchange.handler(async ({ event, context }) => {
  const entityId = `${event.transaction.hash}-${event.logIndex}`;

  // TODO: Replace with actual contract read or static mapping for token addresses.
  // In the original subgraph, getCurvePoolToken performed a contract call to CurveStableSwapNG.coins(tokenIndex).
  // Envio does not support contract reads in handlers by default.
  // For now, store the token index and leave token addresses as empty strings.
  const soldTokenAddress = "";
  const boughtTokenAddress = "";

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
    soldTokenAddress: soldTokenAddress,
    boughtTokenAddress: boughtTokenAddress,
  });
});
