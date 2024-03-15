async function main(): Promise<void> {
  const providerUrl =
    'https://polygon-mainnet.g.alchemy.com/v2/BRf7_NCVEBGEFH-3_EF8lT3Hfq3BUw_d'

  const payload = {
    jsonrpc: '2.0',
    method: 'eth_getBlockByNumber',
    params: ['pending', false], // "true" to include full transaction objects
    id: 1,
  }

  await fetch(providerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        console.error('Error:', data.error.message)
      } else {
        console.log('Pending Transactions:', data.result.transactions)
      }
    })
    .catch((error) => console.error('Error:', error))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
