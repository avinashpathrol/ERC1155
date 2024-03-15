import clsx from 'clsx'
import { type ContractFactory } from 'ethers'
import React from 'react'

import { Button } from '../button/button'
import { Card } from '../card/card'

export function UpgradeContractForm({
  upgradeContractName,
  contractFactory,
  onDeployAndUpdateProxyImplementation,
  implementation,
  proxyAddress,
}: {
  proxyAddress: string
  upgradeContractName?: string
  contractFactory?: ContractFactory
  implementation?: { address: string; bytecode: string }
  onDeployAndUpdateProxyImplementation: () => Promise<void>
}) {
  const [showAllUpgradeBytecode, setShowAllUpgradeBytecode] =
    React.useState(false)

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            <div className="text-4xl">Proxy</div>
            <div className="flex flex-col gap-2">
              <div className="opacity-60 text-xl">address: {proxyAddress}</div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="text-4xl">Implementation</div>
            <div className="flex flex-col gap-2">
              <div className="opacity-60 text-xl">Address</div>
              <div>{implementation?.address}</div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-col gap-2">
          <div className={clsx('flex flex-col gap-6')}>
            {contractFactory ? (
              <div className="flex flex-col gap-6 justify-between">
                <div className="text-4xl">Contract upgrade available</div>
                {upgradeContractName && (
                  <div className="flex flex-col gap-2">
                    <div className="opacity-60 text-xl">New contract name</div>
                    <div>{upgradeContractName}</div>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <div className="opacity-60 text-xl">Bytecode</div>
                    <Button
                      className="py-0 px-2"
                      onClick={() =>
                        setShowAllUpgradeBytecode(!showAllUpgradeBytecode)
                      }
                    >
                      show {showAllUpgradeBytecode ? 'less' : 'more'}
                    </Button>
                  </div>

                  <pre className="whitespace-pre-wrap gap-2">
                    {showAllUpgradeBytecode
                      ? contractFactory.bytecode
                      : `${contractFactory.bytecode.slice(0, 128)}...`}
                  </pre>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="uppercase"
                    onClick={() => {
                      void onDeployAndUpdateProxyImplementation()
                    }}
                  >
                    Deploy contract upgrade
                  </Button>
                </div>
              </div>
            ) : (
              <div>No upgrade available</div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
