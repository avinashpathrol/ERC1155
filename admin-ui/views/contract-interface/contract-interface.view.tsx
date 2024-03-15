'use client'
import * as contractFactories from '@holdr/holdr-contracts'
import { ethers } from 'ethers'
import React from 'react'

import { ConnectWalletUI } from '@/components/connect-wallet/connect-wallet'
import { ContractAdminTabs } from '@/components/contract-admin-tabs/contract-admin-tabs'
import { ContractAdminsForm } from '@/components/contract-admins-form/contract-admins-form'
import type { ArtistState } from '@/components/contract-artists-tab/contract-artists-tab'
import { ContractArtistsTab } from '@/components/contract-artists-tab/contract-artists-tab'
import { ErrorStateCard } from '@/components/error-state-card/error-state-card'
import { UpgradeContractForm } from '@/components/upgrade-contract-form/upgrade-contract-form'

import { useHoldrContract } from './use-holdr-contract'

export function ContractInterface() {
  const {
    connect,
    account,
    chainId,
    contract,
    implementation,
    signer,
    proxyAddress,
    wrongChain,
    isAdmin,
    isOwner,
  } = useHoldrContract()

  const [_contractAdmins, setContractAdmins] = React.useState<string[]>([])

  const [artistState, setArtistState] = React.useState<{
    [key: string]: ArtistState | undefined
  }>({})

  React.useEffect(() => {
    if (!contract) {
      connect()
    }
  }, [connect, contract])

  const handleGetArtistInfo = async (artistId: bigint) => {
    if (!artistState[artistId.toString()]?.fetching) {
      setArtistState((_s) => ({
        ..._s,
        [artistId.toString()]: {
          fetching: true,
          fetched: false,
          id: BigInt(artistId),
        },
      }))
      const address = await contract?.artistAddresses(artistId)
      const maxSupply = await contract?.tokenSupplyLimits(artistId)
      const totalSupply = await contract?.['totalSupply(uint256)'](artistId)
      setArtistState((_s) => ({
        ..._s,
        [artistId.toString()]: {
          address: address ?? 'undefined',
          maxSupply: maxSupply ?? BigInt(0),
          totalSupply: totalSupply ?? BigInt(0),
          fetching: false,
          fetched: true,
          id: BigInt(artistId),
        },
      }))
    }
  }

  const handleAddAdmin = async (address: string) => {
    console.log('handleAddAdmin: ', address)
    if (!contract) {
      throw new Error('No contract.')
    }
    const tx = await contract.addAdmin(address)
    await tx.wait()
    setContractAdmins((admins) => [...admins, address])
  }

  const handleRemoveAdmin = async (address: string) => {
    if (!contract) {
      throw new Error('No contract.')
    }
    const tx = await contract.removeAdmin(address)
    await tx.wait()
    setContractAdmins((admins) => [...admins.filter((a) => a !== address)])
  }

  const handleIsAdmin = async (address: string) => {
    if (!contract) {
      throw new Error('No contract.')
    }
    return contract.isAdmin(address)
  }

  const handleCreateArtist = async (artistId: bigint, address: string) => {
    await contract?.setArtistAddress(artistId, address)
    setArtistState((_s) => ({
      ..._s,
      [artistId.toString()]: {
        address,
        fetching: false,
        fetched: true,
        id: artistId,
      },
    }))
  }

  const handleDeployNewImplementation = async () => {
    const upgradeContractName = process.env.NEXT_PUBLIC_UPGRADE_CONTRACT_NAME
    const UpgradeContractFactoryName = `${upgradeContractName}__factory`
    if (UpgradeContractFactoryName in contractFactories) {
      const UpgradeContractFactory = contractFactories[
        UpgradeContractFactoryName as keyof typeof contractFactories
      ] as any
      if (
        signer &&
        UpgradeContractFactory.abi &&
        UpgradeContractFactory.bytecode
      ) {
        const contractFactory = new ethers.ContractFactory(
          UpgradeContractFactory.abi as string,
          UpgradeContractFactory.bytecode as string,
        )
        const deployment = await contractFactory.connect(signer).deploy()
        const newContract = await deployment.waitForDeployment()

        // const initData =
        //   UpgradeContractFactory.createInterface().encodeFunctionData('init', [
        //     signer.address,
        //     [signer.address],
        //     'https://preview-example.vercel.app/api/metadata/{id}.json',
        //   ])

        await contract?.upgradeToAndCall(await newContract.getAddress(), '0x')
      }
    }
  }

  const handleMint = async (artistId: bigint, extraSupply: number) => {
    const tx = await contract?.adminMint(artistId, BigInt(extraSupply))
    if (tx) {
      await tx.wait()
    }
    // const maxSupply = await contract?.tokenSupplyLimits(artistId)
    setArtistState((_s) => ({
      ..._s,
      [artistId.toString()]: {
        fetching: false,
        fetched: true,
        ..._s[artistId.toString()],
        id: BigInt(artistId),
        totalSupply:
          (_s[artistId.toString()]?.totalSupply ?? BigInt(0)) +
          BigInt(extraSupply),
      },
    }))
  }

  const handleIncreaseArtistMaxSupply = async (
    artistId: bigint,
    extraSupply: number,
  ) => {
    const tx = await contract?.increaseTokenSupplyLimit(
      artistId,
      BigInt(extraSupply),
    )
    if (tx) {
      await tx.wait()
    }
    const maxSupply = await contract?.tokenSupplyLimits(artistId)
    setArtistState((_s) => ({
      ..._s,
      [artistId.toString()]: {
        fetching: false,
        fetched: true,
        id: BigInt(artistId),
        ..._s[artistId.toString()],
        maxSupply,
      },
    }))
  }
  const [activeTab, setActiveTab] = React.useState('artists')
  return (
    <>
      {wrongChain ? (
        <div className="my-6">
          <ErrorStateCard error={'You are not on the correct chain.'} />
        </div>
      ) : !signer ? (
        <div className="my-6">
          <ErrorStateCard
            error={'Not connected.'}
            onAction={() => connect()}
            actionLabel="Connect"
          />
        </div>
      ) : !implementation.bytecode ? (
        <div className="my-6">
          <ErrorStateCard
            error={
              'Could not get deployed contract. Make sure the env var `NEXT_PUBLIC_CONTRACT_ADDRESS` points at the deployed proxy contract and the hardhat network is running.'
            }
          />
        </div>
      ) : (
        <>
          <ConnectWalletUI
            account={account}
            onConnect={connect}
            chainId={chainId}
            isAdmin={isAdmin ?? false}
            isOwner={isOwner ?? false}
          />
          <div className="mb-6">
            <ContractAdminTabs
              activeTab={activeTab}
              onTabChange={(t) => setActiveTab(t)}
            />
          </div>
          {activeTab === 'artists' ? (
            <>
              {isAdmin ? (
                <ContractArtistsTab
                  artistState={artistState}
                  onCreateArtist={handleCreateArtist}
                  onFetchArtistInfo={handleGetArtistInfo}
                  onMint={handleMint}
                  onIncreaseArtistMaxSupply={handleIncreaseArtistMaxSupply}
                />
              ) : (
                <ErrorStateCard
                  error={
                    'This account is not an admin. You probably need to switch accounts.'
                  }
                />
              )}
            </>
          ) : activeTab === 'admins' ? (
            <>
              {isOwner ? (
                <ContractAdminsForm
                  onAdminAdd={handleAddAdmin}
                  onAdminRemove={handleRemoveAdmin}
                  onIsAdmin={handleIsAdmin}
                />
              ) : (
                <ErrorStateCard
                  error={
                    'This account is not the contract owner. You probably need to switch accounts.'
                  }
                />
              )}
            </>
          ) : (
            activeTab === 'contract_upgrade' && (
              <>
                {isOwner ? (
                  <UpgradeContractForm
                    proxyAddress={proxyAddress}
                    onDeployAndUpdateProxyImplementation={
                      handleDeployNewImplementation
                    }
                    upgradeContractName={
                      process.env.NEXT_PUBLIC_UPGRADE_CONTRACT_NAME
                    }
                    implementation={implementation}
                    contractFactory={
                      (contractFactories as any)[
                        `${process.env.NEXT_PUBLIC_UPGRADE_CONTRACT_NAME}__factory`
                      ]
                    }
                  />
                ) : (
                  <ErrorStateCard
                    error={
                      'This account is not the contract owner. You probably need to switch accounts.'
                    }
                  />
                )}
              </>
            )
          )}
        </>
      )}
    </>
  )
}
