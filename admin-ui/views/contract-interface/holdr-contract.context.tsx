'use client'
import React from 'react'

export interface IHoldrContractContext {
  contractAddress: string
  contractChainId: number
}

export const HoldrContractContext = React.createContext<IHoldrContractContext>(
  {} as IHoldrContractContext,
)

// export const HoldrContractContextProvider = HoldrContractContext.Provider

export const HoldrContractContextProvider = ({
  children,
  contractAddress,
  contractChainId,
}: {
  children: React.ReactNode
  contractAddress: string
  contractChainId: number
}) => {
  return (
    <HoldrContractContext.Provider value={{ contractAddress, contractChainId }}>
      {children}
    </HoldrContractContext.Provider>
  )
}
