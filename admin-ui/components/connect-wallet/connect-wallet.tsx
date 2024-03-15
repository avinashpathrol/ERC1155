export function ConnectWalletUI({
  onConnect,
  account,
  chainId,
  isOwner,
  isAdmin,
}: {
  onConnect: () => void
  chainId?: bigint
  account?: string
  isOwner?: boolean
  isAdmin?: boolean
}) {
  return (
    <div className="flex gap-2">
      {!account && (
        <button
          className="bg-black border p-2"
          onClick={onConnect}
          disabled={false}
        >
          {account ? 'Connected!!' : 'Connect'}
        </button>
      )}

      {account && (
        <div className="flex flex-col gap-1">
          <div className="flex gap-1 opacity-70">Wallet Address / Chain ID</div>
          <div className="flex gap-1">
            <pre>{account}</pre> /{' '}
            <pre>{chainId?.toString() ?? 'no chain'}</pre>
          </div>
          <div className="flex gap-1">
            Admin:{' '}
            {typeof isAdmin === 'undefined'
              ? 'unknown'
              : !isAdmin
                ? 'false'
                : 'true'}{' '}
            - Owner:{' '}
            {typeof isOwner === 'undefined'
              ? 'unknown'
              : !isOwner
                ? 'false'
                : 'true'}
          </div>
        </div>
      )}
    </div>
  )
}
