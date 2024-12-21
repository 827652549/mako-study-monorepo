import { createClient } from '@clickhouse/client'


const ckClient = createClient({
    url: `http://localhost:8123`,
    password: '',
})
main().catch(console.error);

// @ts-ignore
async function main() {
  await ckClient.exec({
    query: `
        CREATE TABLE IF NOT EXISTS clickhouse_js_example_table
        (
            id
            UInt64,
            name
            String
        )
            ORDER BY
        (
            id
        )
    `,
    clickhouse_settings: {
      wait_end_of_query: 1,
    },
  })
  await ckClient.insert({
    table: 'clickhouse_js_example_table',
    values: [
      { id: 42, name: 'foo' },
      { id: 42, name: 'bar' },
    ],
    format: 'JSONEachRow',
  })
  const rows = await ckClient.query({
    query: 'SELECT * FROM clickhouse_js_example_table',
    format: 'JSONEachRow',
  })

  console.log(await rows.json())
}