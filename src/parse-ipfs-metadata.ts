import {
  json,
  Bytes,
  JSONValue,
  BigDecimal,
  log,
} from '@graphprotocol/graph-ts';
import {
  DelegateMetadata,
  DelegateMetrics,
  VotingCommittee,
  VotingStrategy,
} from '../generated/schema';

function extractBigDecimal(value: string): BigDecimal {
  // we receive values in the shape of '94.23%', so we need to remove the % and convert to a BigDecimal
  if (!value || value == 'No Data') return BigDecimal.fromString('0.0');

  const valueWithoutPercentage = value.replace('%', '');
  const valueAsBigDecimal = BigDecimal.fromString(valueWithoutPercentage);
  return valueAsBigDecimal;
}

export function handleMetadata(content: Bytes): void {
  const value = json.fromBytes(content).toObject();

  if (value) {
    // Update voting committees
    // const vcs = value.get(
    //   'votingCommittees',
    // ) as JSONValue;

    // if (vcs) {
    //   const votingCommittees = (vcs).toArray();

    //   votingCommittees.forEach((votingCommittee) => {
    //     const votingCommitteeObject = votingCommittee.toObject();
    //     const votingCommitteeId = (votingCommitteeObject.get(
    //       'name',
    //     ) as JSONValue).toString();

    //     // Check if voting committee exist
    //     let delegateVotingCommittee = VotingCommittee.load(votingCommitteeId);

    //     if (!delegateVotingCommittee) {
    //       delegateVotingCommittee = new VotingCommittee(votingCommitteeId);
    //     }

    //     // Update the delegate voting committee
    //     const description = (votingCommitteeObject.get(
    //       'description',
    //     ) as JSONValue).toString();
    //     delegateVotingCommittee.description = description;

    //     // name
    //     const name = (votingCommitteeObject.get('name') as JSONValue).toString();
    //     delegateVotingCommittee.name = name;

    //     // image
    //     const image = (votingCommitteeObject.get(
    //       'image',
    //     ) as JSONValue).toString();
    //     delegateVotingCommittee.image = image;

    //     // externalProfileURL
    //     const externalProfileURL = votingCommitteeObject.get(
    //       'externalProfileURL',
    //     ) as JSONValue;

    //     delegateVotingCommittee.externalProfileURL = externalProfileURL.isNull()
    //       ? ''
    //       : externalProfileURL.toString();

    //     // Define the strategies
    //     const mapStrategies = (votingCommitteeObject.get(
    //       'strategies',
    //     ) as JSONValue).toArray();

    //     const strategyIds = mapStrategies.map<string>((strategy) => {
    //       const strategyObject = strategy.toObject();

    //       // Check if strategy exist
    //       const strategyName = (strategyObject.get(
    //         'name',
    //       ) as JSONValue).toString();
    //       let delegateStrategy = VotingStrategy.load(strategyName);

    //       if (!delegateStrategy) {
    //         delegateStrategy = new VotingStrategy(strategyName);
    //       }

    //       delegateStrategy.name = strategyName;

    //       // Update the delegate strategy
    //       const description = (strategyObject.get(
    //         'description',
    //       ) as JSONValue).toString();
    //       delegateStrategy.description = description;

    //       // Delegates (array of addresses)
    //       const delegates = (strategyObject.get('delegates') as JSONValue)
    //         .toArray()
    //         .map<string>((delegate) => {
    //           return delegate.toString().toLowerCase();
    //         });

    //       delegateStrategy.delegates = delegates;

    //       // Save the delegate strategy
    //       delegateStrategy.save();

    //       return strategyName;
    //     });

    //     delegateVotingCommittee.strategies = strategyIds;
    //     // Save the delegate voting committee
    //     delegateVotingCommittee.save();
    //   });
    // }

    (value.get('delegates') as JSONValue).toArray().forEach((delegateData) => {
      const delegateDataObject = delegateData.toObject();

      const delegateAddress = (delegateDataObject.get(
        'voteDelegateAddress',
      ) as JSONValue)
        .toString()
        .toLowerCase();

      log.debug('Delegate address: {}', [delegateAddress]);

      let delegateMetadata = DelegateMetadata.load(delegateAddress);

      if (!delegateMetadata) {
        delegateMetadata = new DelegateMetadata(delegateAddress);
      }

      const profile = delegateDataObject.get('profile') as JSONValue;

      delegateMetadata.name = (profile
        .toObject()
        .get('name') as JSONValue).toString();

      log.debug('Delegate name: {}', [delegateMetadata.name]);

      delegateMetadata.description = (profile
        .toObject()
        .get('description') as JSONValue).toString();

      log.debug('Delegate description: {}', [delegateMetadata.description]);

      delegateMetadata.image = (delegateDataObject.get(
        'image',
      ) as JSONValue).toString();

      log.debug('Delegate image: {}', [delegateMetadata.image]);

      const externalProfileURL = profile
        .toObject()
        .get('externalProfileURL') as JSONValue;
      delegateMetadata.externalProfileURL = externalProfileURL.isNull()
        ? ''
        : externalProfileURL.toString();

      log.debug('Delegate external profile url: {}', [
        delegateMetadata.externalProfileURL,
      ]);

      delegateMetadata.coreUnitMember = (delegateDataObject.get(
        'cuMember',
      ) as JSONValue).toBool();

      log.debug('Before metrics: {}', ['']);

      let metrics = DelegateMetrics.load(delegateAddress);
      const delegateMetricsData = delegateDataObject.get(
        'metrics',
      ) as JSONValue;
      if (!metrics) {
        metrics = new DelegateMetrics(delegateAddress);
      }

      // Parse the metrics, they are strings like "94.23%" into BigDecimals
      const rawCombinedParticipation =
        (delegateMetricsData
          .toObject()
          .get('combinedParticipation') as JSONValue).toString() || '0.0%';
      metrics.combinedParticipation = extractBigDecimal(
        rawCombinedParticipation,
      );

      log.debug('Delegate combinedParticipation: {}', [
        metrics.combinedParticipation.toString(),
      ]);

      const rawPollParticipation =
        (delegateMetricsData
          .toObject()
          .get('pollParticipation') as JSONValue).toString() || '0.0%';
      metrics.pollParticipation = extractBigDecimal(rawPollParticipation);

      log.debug('Delegate pollParticipation: {}', [
        metrics.pollParticipation.toString(),
      ]);

      const rawExecutiveParticipation =
        (delegateMetricsData
          .toObject()
          .get('executiveParticipation') as JSONValue).toString() || '0.0%';
      metrics.executiveParticipation = extractBigDecimal(
        rawExecutiveParticipation,
      );

      log.debug('Delegate executiveParticipation: {}', [
        metrics.executiveParticipation.toString(),
      ]);

      const rawCommunication =
        (delegateMetricsData
          .toObject()
          .get('communication') as JSONValue).toString() || '0.0%';
      metrics.communication = extractBigDecimal(rawCommunication);

      log.debug('Delegate communication: {}', [
        metrics.communication.toString(),
      ]);

      // save the metrics
      metrics.save();

      log.debug('Delegate metrics saved: {}', [metrics.id]);

      // Update the delgate metadata to point to the metrics
      delegateMetadata.metrics = metrics.id;

      // save the delegate metadata
      delegateMetadata.save();

      log.debug('Delegate metadata saved: {}', [delegateMetadata.id]);
    });
  }
}
