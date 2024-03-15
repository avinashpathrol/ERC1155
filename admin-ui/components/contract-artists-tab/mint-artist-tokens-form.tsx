import React from 'react'

import { Button } from '../button/button'
import { Input } from '../input/input'

export function MintArtistTokensForm({
  artistId,
  onMint,
}: {
  artistId: bigint
  onMint: (artistId: bigint, extraSupply: number) => Promise<void>
}) {
  const [extraSupply, setExtra] = React.useState<number>()

  const handleSubmitAttempt = () => {
    if (extraSupply && extraSupply <= 1000) {
      void onMint(artistId, extraSupply)
      setExtra(undefined)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={`${extraSupply ?? ''}`}
        inputType="number"
        onChange={(value) => setExtra(parseInt(value, 10))}
        placeholder="Number to mint"
      />
      <Button onClick={handleSubmitAttempt}>Mint token</Button>
    </div>
  )
}
