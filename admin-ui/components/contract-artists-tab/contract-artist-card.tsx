import clsx from 'clsx'
import { ethers } from 'ethers'
import React from 'react'

import { Button } from '../button/button'
import { Card } from '../card/card'
import { Input } from '../input/input'
import type { ArtistState } from './contract-artists-tab'
import { IncreaseArtistMaxSupplyUI } from './increase-artist-supply-form'
import { MintArtistTokensForm } from './mint-artist-tokens-form'

export function ContractArtistCard({
  artist,
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
  artist: ArtistState
}) {
  const [shouldShowAddressInput, setShouldShowAddressInput] =
    React.useState(false)
  const [artistAddressValue, setArtistAddressValue] = React.useState('')

  const handleCreateArtist = () => {
    if (!shouldShowAddressInput) {
      setShouldShowAddressInput(true)
    } else {
      // eslint-disable-next-line no-lonely-if
      if (artist.id && artistAddressValue) {
        void onCreateArtist(artist.id, artistAddressValue).then(() => {
          setArtistAddressValue('')
          setShouldShowAddressInput(false)
        })
      }
    }
  }

  const isCreated = artist.address && artist.address !== ethers.ZeroAddress

  return (
    <Card className="flex flex-col min-h-[20rem]">
      <div className="flex-1 flex flex-col gap-2 h-full">
        <div className={clsx('flex-1 flex flex-col gap-6 h-full')}>
          <div className="flex flex-col gap-1 justify-between">
            <div className="flex gap-2 justify-between">
              <div className="text-3xl">Artist: #{artist.id.toString()}</div>
              <Button
                className="p-2 text-md"
                onClick={() => void onFetchArtistInfo(artist.id)}
              >
                Fetch
              </Button>
            </div>
            {isCreated && <pre>{artist.address}</pre>}
          </div>
          {!artist.fetched && !artist.fetching ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Button
                onClick={() => void onFetchArtistInfo(artist.id)}
                className="text-2xl p-4 px-6"
              >
                Fetch
              </Button>
            </div>
          ) : (
            !isCreated &&
            artist.fetched && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className=" flex flex-col gap-4">
                  {shouldShowAddressInput && (
                    <Input
                      onChange={(v) => setArtistAddressValue(v)}
                      value={artistAddressValue}
                      placeholder="Artist address..."
                      className="w-full text-xl py-4"
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <Button
                      className="p-2 px-4 text-xl w-full"
                      onClick={handleCreateArtist}
                    >
                      Create Artist
                    </Button>
                    {shouldShowAddressInput && (
                      <Button
                        className="p-2 text-xl w-full"
                        onClick={() => {
                          setArtistAddressValue('')
                          setShouldShowAddressInput(false)
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
          {isCreated ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  Total minted: <div>{artist.totalSupply?.toString() ?? 0}</div>
                </div>
                <MintArtistTokensForm artistId={artist.id} onMint={onMint} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  Max Supply:{' '}
                  <div className="italic">
                    (currently {artist.maxSupply?.toString() ?? 0})
                  </div>
                </div>
                <IncreaseArtistMaxSupplyUI
                  artistId={artist.id}
                  maxSupply={artist.maxSupply ? Number(artist.maxSupply) : 0}
                  onIncreaseArtistMaxSupply={onIncreaseArtistMaxSupply}
                />
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Card>
  )
}
