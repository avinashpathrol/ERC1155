import { BigNumber } from '@ethersproject/bignumber'
import type { HoldrArtistsERC1155, HoldrProxy } from '@holdr/holdr-contracts'
import {
  HoldrArtistsERC1155__factory,
  HoldrProxy__factory,
} from '@holdr/holdr-contracts'
import type { Eip1193Provider, JsonRpcSigner, Provider } from 'ethers'
import { ethers } from 'ethers'
import React from 'react'

import { HoldrContractContext } from './holdr-contract.context'

export function toEip1967Hash(label: string): string {
  const hash = ethers.keccak256(Buffer.from(label))
  const bigNumber = BigInt(hash) - BigInt(1)
  return '0x' + bigNumber.toString(16)
}

export const useHoldrContract = () => {
  const context = React.useContext(HoldrContractContext)

  const [accountAndSigner, setAccountAndSigner] = React.useState<{
    account: string
    signer: JsonRpcSigner
    isOwner?: boolean
    isAdmin?: boolean
    provider: Provider
  }>()
  const [selectedChainId, setSelectedChainId] = React.useState<bigint>()

  const [contract, setContract] = React.useState<{
    proxy: HoldrProxy
    holdr: HoldrArtistsERC1155
  }>()

  const [implementation, setImplementation] = React.useState({
    address: '',
    bytecode: '',
  })

  React.useEffect(() => {
    if (accountAndSigner) {
      void accountAndSigner.provider
        .getStorage(
          context.contractAddress,
          toEip1967Hash('eip1967.proxy.implementation'),
        )
        .then(async (_implementationData) => {
          const dataString = BigNumber.from(_implementationData).toHexString()
          if (dataString !== '0x00') {
            const _implementationAddress =
              BigNumber.from(_implementationData).toHexString()
            const impl = {
              address: _implementationAddress,
              bytecode: await accountAndSigner.provider.getCode(
                _implementationAddress,
              ),
            }
            setImplementation(impl)
          }
        })
    }
  }, [
    contract?.holdr,
    accountAndSigner?.provider,
    context.contractAddress,
    accountAndSigner,
  ])

  const [_errorMessage, setErrorMessage] = React.useState<string>()

  const handleAccountChange = async (
    p: Provider,
    newAccount?: JsonRpcSigner,
  ) => {
    const address = await newAccount?.getAddress()
    const { chainId } = await p.getNetwork()
    if (newAccount && address) {
      const proxy = HoldrProxy__factory.connect(
        context.contractAddress,
        newAccount,
      )
      const holdr = HoldrArtistsERC1155__factory.connect(
        context.contractAddress,
        newAccount,
      )
      const isAdmin = address ? await holdr.isAdmin(address) : undefined
      const isOwner = address ? (await holdr.owner()) === address : undefined
      setAccountAndSigner({
        account: address,
        signer: newAccount,
        provider: p,
        isAdmin,
        isOwner,
      })
      setContract({
        holdr,
        proxy,
      })
    } else {
      setAccountAndSigner(undefined)
      setContract(undefined)
    }
    setSelectedChainId(chainId)
  }

  const connect = () => {
    const w = window as any

    const accountUpdate = () => {
      try {
        const p = new ethers.BrowserProvider(w.ethereum as Eip1193Provider)
        void p
          .getSigner()
          .then(async (_s) => {
            await handleAccountChange(p, _s)
          })
          .catch((e) => {
            console.log('Error:', e)
            throw e
          })
      } catch (_e) {
        /* empty */
      }
    }

    if (w.ethereum) {
      w.ethereum.on('accountsChanged', (_accounts: string[]) => {
        accountUpdate()
      })
      w.ethereum.on(
        'chainChanged',
        (network: string, oldNetwork: string | undefined) => {
          console.log('Network change:', { network, oldNetwork })
          accountUpdate()
        },
      )
    } else {
      setErrorMessage('Please install Metamask!')
    }
    accountUpdate()
  }
  const wrongChain = selectedChainId
    ? selectedChainId !== BigInt(context.contractChainId)
    : undefined

  return {
    contract: contract?.holdr,
    implementation,
    account: accountAndSigner?.account,
    chainId: selectedChainId,
    provider: accountAndSigner?.provider,
    signer: accountAndSigner?.signer,
    isAdmin: accountAndSigner?.isAdmin,
    isOwner: accountAndSigner?.isOwner,
    proxyAddress: context.contractAddress,
    wrongChain,
    connect,
  }
}
