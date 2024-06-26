import { HoldrContractContextProvider } from '@/views/contract-interface/holdr-contract.context'

import { ContractInterface } from '../views/contract-interface/contract-interface.view'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-4xl">Holdr smart contract interface</span>
          </a>
        </div>
      </div>

      <div className="relative flex flex-1 before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40">
        <div className="z-10 w-full">
          <HoldrContractContextProvider
            contractAddress={process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? '0x0'}
            contractChainId={
              process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID
                ? parseInt(process.env.NEXT_PUBLIC_CONTRACT_CHAIN_ID, 10)
                : -1
            }
          >
            <ContractInterface />
          </HoldrContractContextProvider>
        </div>
      </div>
    </main>
  )
}
