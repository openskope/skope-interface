/**
 * This script deletes any indices not listed in the `reservedIndices` from the `host`.
 */

const host = '141.142.209.157:9200';
const reservedIndices = [
  'skope',
];

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
  host,
  log: 'trace',
});

const reservedIndexMap = reservedIndices.reduce((acc, key) => ({
  ...acc,
  [key]: true,
}), {});

(async () => {
  const result = await client.indices.stats();

  for (const key in result.indices) {
    if (!(key in reservedIndexMap)) {
      await client.indices.delete({
        index: key,
      });
    }
  }

  return 'done';
})().then(
  (result) => console.log(result),
  (error) => console.error(error),
);
