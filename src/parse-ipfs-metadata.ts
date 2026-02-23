/**
 * IPFS Metadata Parser for Delegate information.
 *
 * In The Graph, this was triggered as an IPFS file data source handler.
 * In Envio, we use fetch() to retrieve IPFS content and parse it manually.
 * This function can be called from delegate factory handlers or as a standalone script.
 */

interface DelegateProfile {
  name: string;
  description: string;
  externalProfileURL?: string;
}

interface DelegateMetricsData {
  combinedParticipation: string;
  pollParticipation: string;
  executiveParticipation: string;
  communication: string;
}

interface DelegateData {
  voteDelegateAddress: string;
  profile: DelegateProfile;
  image: string;
  cuMember: boolean;
  metrics: DelegateMetricsData;
}

interface MetadataPayload {
  delegates: DelegateData[];
}

function extractBigDecimal(value: string): string {
  // Values come as '94.23%', remove the % and return as string
  if (!value || value === 'No Data') return '0.0';
  return value.replace('%', '');
}

/**
 * Fetch and parse delegate metadata from IPFS
 * @param ipfsHash - The IPFS CID to fetch
 * @param context - The Envio handler context for entity operations
 */
export async function fetchAndParseMetadata(
  ipfsHash: string,
  context: any,
): Promise<void> {
  try {
    const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs';
    const response = await fetch(`${gateway}/${ipfsHash}`);

    if (!response.ok) {
      console.error(`Failed to fetch IPFS content: ${response.status}`);
      return;
    }

    const data = (await response.json()) as MetadataPayload;
    await parseMetadata(data, context);
  } catch (error) {
    console.error('Error fetching IPFS metadata:', error);
  }
}

/**
 * Parse delegate metadata JSON and store entities
 */
export async function parseMetadata(
  data: MetadataPayload,
  context: any,
): Promise<void> {
  if (!data || !data.delegates) return;

  for (const delegateData of data.delegates) {
    const delegateAddress = delegateData.voteDelegateAddress.toLowerCase();

    // Create/update DelegateMetrics
    const metrics = {
      id: delegateAddress,
      combinedParticipation: extractBigDecimal(
        delegateData.metrics?.combinedParticipation || '0.0%',
      ),
      pollParticipation: extractBigDecimal(
        delegateData.metrics?.pollParticipation || '0.0%',
      ),
      executiveParticipation: extractBigDecimal(
        delegateData.metrics?.executiveParticipation || '0.0%',
      ),
      communication: extractBigDecimal(
        delegateData.metrics?.communication || '0.0%',
      ),
    };
    context.DelegateMetrics.set(metrics);

    // Create/update DelegateMetadata
    const metadata = {
      id: delegateAddress,
      name: delegateData.profile?.name || '',
      description: delegateData.profile?.description || '',
      image: delegateData.image || '',
      externalProfileURL: delegateData.profile?.externalProfileURL || '',
      metrics_id: delegateAddress,
      coreUnitMember: delegateData.cuMember || false,
    };
    context.DelegateMetadata.set(metadata);
  }
}
