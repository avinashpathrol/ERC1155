import React from 'react'

import { ContractArtistCard } from './contract-artist-card'

export interface ArtistState {
  fetching: boolean
  fetched: boolean
  maxSupply?: bigint
  address?: string
  totalSupply?: bigint
  id: bigint
}

export function ContractArtistsTab({
  artistState = {},
  onFetchArtistInfo,
  onIncreaseArtistMaxSupply,
  onMint,
  onCreateArtist,
}: {
  onCreateArtist: (artistId: bigint, artistAddress: string) => Promise<void>
  onIncreaseArtistMaxSupply: (
    artistId: bigint,
    extraSupply: number,
  ) => Promise<void>
  onMint: (artistId: bigint, extraSupply: number) => Promise<void>
  onFetchArtistInfo: (artistId: bigint) => Promise<void>
  artistState: {
    [key: string]: ArtistState | undefined
  }
}) {
  const [_focusedArtistId, _setFocusedArtistId] = React.useState<string>()

  //   const handleArtistIdInput = (_artistId: string) => {
  //     setArtistId(_artistId)
  //     if (!artistState[_artistId]?.fetching) {
  //       void onFetchArtistInfo(_artistId)
  //     }
  //   }

  return (
    <div className="flex flex-wrap gap-2 grid grid-cols-3 w-full">
      {new Array(100).fill(1).map((_, i) => {
        const artistId = i + 1
        return (
          <div key={i} className="w-full rounded-lg mb-4">
            <ContractArtistCard
              onFetchArtistInfo={onFetchArtistInfo}
              artist={
                artistId in artistState
                  ? // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    artistState[artistId]!
                  : {
                      fetching: false,
                      fetched: false,
                      id: BigInt(artistId),
                    }
              }
              onIncreaseArtistMaxSupply={onIncreaseArtistMaxSupply}
              onMint={onMint}
              onCreateArtist={onCreateArtist}
            />
          </div>
        )
      })}
    </div>
  )
}
