import React from 'react'

import { Button } from '../button/button'
import { Input } from '../input/input'

export function IncreaseArtistMaxSupplyUI({
  artistId,
  onIncreaseArtistMaxSupply,
  maxSupply = 0,
}: {
  artistId: bigint
  maxSupply: number
  onIncreaseArtistMaxSupply: (
    artistId: bigint,
    extraSupply: number,
  ) => Promise<void>
}) {
  const [extraSupply, setExtra] = React.useState<number>()

  const handleSubmitAttempt = () => {
    if (extraSupply && extraSupply > 0 && extraSupply + maxSupply <= 1000) {
      void onIncreaseArtistMaxSupply(artistId, extraSupply)
      setExtra(undefined)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={`${extraSupply ?? ''}`}
        inputType="number"
        onChange={(v) => setExtra(parseInt(v, 10))}
        placeholder="Extra supply"
      />
      <Button onClick={handleSubmitAttempt}>Increase Max Supply</Button>
    </div>
  )
}
