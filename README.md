# DISCLAIMER

THIS sky-subgraph SOFTWARE CODE REPOSITORY (“REPOSITORY”) IS MADE AVAILABLE TO YOU BY JETSTREAMGG (“DEVELOPER”). WHILE DEVELOPER GENERATED THE OPEN-SOURCE CODE WITHIN THIS REPOSITORY, DEVELOPER DOES NOT MAINTAIN OR OPERATE ANY SOFTWARE PROTOCOL, PLATFORM, PRODUCT OR SERVICE THAT INCORPORATES SUCH SOURCE CODE.

DEVELOPER MAY, FROM TIME TO TIME, GENERATE, MODIFY AND/OR UPDATE SOURCE CODE WITHIN THIS REPOSITORY BUT IS UNDER NO OBLIGATION TO DO SO. HOWEVER, DEVELOPER WILL NOT PERFORM REPOSITORY MANAGEMENT FUNCTIONS, SUCH AS REVIEWING THIRD-PARTY CONTRIBUTIONS, MANAGING COMMUNITY INTERACTIONS OR HANDLING NON-CODING ADMINISTRATIVE TASKS.

THE SOURCE CODE MADE AVAILABLE VIA THIS REPOSITORY IS OFFERED ON AN “AS-IS,” “AS-AVAILABLE” BASIS WITHOUT ANY REPRESENTATIONS, WARRANTIES OR GUARANTEES OF ANY KIND, EITHER EXPRESS OR IMPLIED. DEVELOPER DISCLAIMS ANY AND ALL LIABILITY FOR ANY ISSUES THAT ARISE FROM THE USE, MODIFICATION OR DISTRIBUTION OF THE SOURCE CODE MADE AVAILABLE VIA THIS REPOSITORY. PLEASE REVIEW, TEST AND AUDIT ANY SOURCE CODE PRIOR TO MAKING USE OF SUCH SOURCE CODE. BY ACCESSING OR USING ANY SOURCE CODE MADE AVAILABLE VIA THIS REPOSITORY, YOU UNDERSTAND, ACKNOWLEDGE AND AGREE TO THE RISKS OF USING THE SOURCE CODE AND THE LIMITED SCOPE OF DEVELOPER’S ROLE AS DESCRIBED HEREIN. YOU AGREE THAT YOU WILL NOT HOLD DEVELOPER LIABLE OR RESPONSIBLE FOR ANY LOSSES OR DAMAGES ARISING FROM YOUR USE OF THE SOURCE CODE MADE AVAILABLE VIA THIS REPOSITORY.

# Reservation of trademark rights

The materials in this repository may include references to our trademarks as well as trademarks owned by other persons. No rights are granted to you to use any trade names, trademarks, service marks, or product names, whether owned by us or by others, except solely as necessary for reasonable and customary use in describing the origin of the source materials. All trademark rights are expressly reserved by the respective owners.

# Sky Ecosystem subgraph

## Requirements:

- Install the graph globally `yarn global add @graphprotocol/graph-cli`

## Development

`yarn install`

then

`yarn build:testnet` for testnet

or

`yarn build:mainnet` for mainnet

etc

## Running indexer locally

Create a `.env` file in the root dir and set environment var

`ETHEREUM_NODE` should be the network RPC URL prefixed by the network name, e.g. `testnet:https://virtual.mainnet.rpc.tenderly.co/<id>`

In one terminal window, run `docker-compose up`, newer versions of docker compose use `docker compose up` instead of `docker-compose up`

In another window, run `yarn create-local:mainnet`, then `yarn deploy-local:mainnet`. Data will begin indexing. For other networks, run the appropriate command.

To query the local indexer, you can access GraphiQL at `http://localhost:8000/subgraphs/name/jetstream-local/sky-subgraph-mainnet`

## Deploying

To deploy to mainnet:
`yarn deploy:mainnet`

To deploy to testnet:
`yarn deploy:testnet`

Note: See internal documentation for testnet subgraph management information.

### Important note regarding the Tenderly deployment

In order to deploy the Tenderly subgraph, you need to connect to Cloudflare's WARP client. This is required to access the graph deployment endpoint in a secure way.

This client can be downloaded from: [https://1.1.1.1/](https://1.1.1.1/). After installing it, you'll have to go to its settings, click "Account" and log into the right Team (ask TechOps if you don't know it) using your work email.

### Checking the status of the deployment

You can check the status of the deployment by running the following query on [https://status-subgraph-staging.sky.money/graphql/playground](https://status-subgraph-staging.sky.money/graphql/playground):

```graphql
{
  indexingStatusesForSubgraphName(
    subgraphName: "jetstreamgg/sky-subgraph-testnet"
  ) {
    subgraph
    health
    synced
    fatalError {
      handler
      message
      deterministic
    }
    nonFatalErrors {
      handler
    }
    chains {
      chainHeadBlock {
        number
        __typename
      }
      latestBlock {
        number
        __typename
      }
      earliestBlock {
        number
        __typename
      }
    }
  }
}
```

## Deployment URLs

Staging:
[https://query-subgraph-staging.sky.money](https://query-subgraph-staging.sky.money) is for sending queries to a subgraph from anywhere we allow. Maps internally to port 8000.

Use `/subgraphs/name/jetstreamgg/sky-subgraph-testnet/graphql?query=<query>` for testnet and `/subgraphs/name/jetstreamgg/sky-subgraph-mainnet/graphql?query=<query>` for mainnet.

[https://deploy-subgraph-staging.sky.money](https://deploy-subgraph-staging.sky.money) is only used for deploying from the CLI. Maps internally to port 8020. This one is expected to not allow GET requests because that's the behavior of that service.

[https://status-subgraph-staging.sky.money](https://status-subgraph-staging.sky.money) is for sending queries to the nodes in order to check info about them for health checks and debugging. Maps internally to port 8030.

[https://subs-subgraph-staging.sky.money](https://subs-subgraph-staging.sky.money) is for subgraph subscriptions. Maps internally to port 8001.

Mainnet:
Same as staging URLs but remove `-staging` from the domain (i.e. `https://query-subgraph.sky.money`)

## Adding a new reward

Modify the `subgraph.yaml` file and add a new `mapping` section that uses the `src/staking-rewards.ts` file:

```shell
  - kind: ethereum
    name: Rewards
    network: tenderly
    source:
      abi: Rewards
      address: "0xc1f21dd64f71ffa9b1152f6844e7ea3c57383685"
      startBlock: 19062247
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Reward
        - RewardClaim
        - Supply
        - Withdraw
      abis:
        - name: Rewards
          file: ./abis/rewards/Rewards.json
      eventHandlers:
        - event: RewardClaim(indexed address,uint256)
          handler: handleRewardClaimed
        - event: Supplied(indexed address,uint256)
          handler: handleRewardSupplied
        - event: Withdrawn(indexed address,uint256)
          handler: handleRewardWithdrawn
      file: ./src/rewards.ts
```

## Adding a New Network

To add support for a new blockchain network to the subgraph, you need to perform two main steps:

1.  Create a network-specific configuration file.
2.  Add corresponding scripts to `package.json` for building and deploying the subgraph for this new network.

### 1. Create a Network Configuration File

In the `networks/` directory, create a new JSON file for your network. For instance, if your new network is named `mynewnetwork`, you would create `networks/mynewnetwork.json`.

This file provides the necessary details for the `subgraph.template.yaml` to generate a `subgraph.yaml` specific to `mynewnetwork`. It defines the network identifier (as recognized by The Graph) and the addresses and start blocks for the contracts to be indexed on this network.

The structure of this JSON file should be as follows. Replace `"mynewnetwork"` with the actual identifier for your network (e.g., `goerli`, `sepolia`, `matic`, etc.) and update the contract details accordingly.

**Example `networks/mynewnetwork.json`:**
