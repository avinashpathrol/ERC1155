import clsx from 'clsx'
import React from 'react'

import { Button } from '../button/button'
import { Card } from '../card/card'
import { Input } from '../input/input'

export function ContractAdminsForm({
  onAdminAdd,
  onAdminRemove,
  onIsAdmin,
}: {
  onAdminAdd: (address: string) => Promise<void>
  onAdminRemove: (address: string) => Promise<void>
  onIsAdmin: (address: string) => Promise<boolean>
}) {
  const [adminToTestAddress, setAdminToTestAddress] = React.useState<{
    address: string
    result?: boolean
  }>({
    address: '',
    result: undefined,
  })
  const [adminToRemoveAddress, setAdminToRemoveAddress] = React.useState('')
  const [adminToAddAddress, setAdminToAddAddress] = React.useState('')

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-col gap-2">
          <div className={clsx('flex flex-col gap-6')}>
            <div className="flex flex-col gap-4 justify-between">
              <div className="text-3xl">Add admin address</div>
              <div className="flex gap-2">
                <Input
                  value={adminToAddAddress}
                  inputType="text"
                  onChange={(v) => {
                    console.log('Update:', v)
                    setAdminToAddAddress(v)
                  }}
                  placeholder="Address of admin to add..."
                />
                <Button
                  onClick={() => {
                    console.log('To address:', adminToAddAddress)
                    if (adminToAddAddress) {
                      void onAdminAdd(adminToAddAddress)
                      setAdminToAddAddress('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div>
          <div>
            <div className="flex flex-col gap-4 justify-between">
              <div className="text-3xl">Remove admin address</div>
              <div className="flex gap-2">
                <Input
                  value={adminToRemoveAddress}
                  inputType="text"
                  onChange={(v) => setAdminToRemoveAddress(v)}
                  placeholder="Address of admin to remove..."
                />
                <Button
                  onClick={() => {
                    if (adminToRemoveAddress) {
                      void onAdminRemove(adminToRemoveAddress)
                      setAdminToRemoveAddress('')
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div>
          <div>
            <div className="flex flex-col gap-4 justify-between">
              <div className="text-3xl">
                Is Admin (enter an address to test adminship)
              </div>
              <div className="flex gap-2">
                <Input
                  value={adminToTestAddress.address}
                  inputType="text"
                  onChange={(v) => setAdminToTestAddress({ address: v })}
                  placeholder="Address of admin to test..."
                />
                <Button
                  onClick={() => {
                    void onIsAdmin(adminToTestAddress.address).then(
                      (result) => {
                        console.log('result:', result)
                        setAdminToTestAddress({
                          address: adminToTestAddress.address,
                          result,
                        })
                      },
                    )
                  }}
                >
                  Test
                </Button>
              </div>
              {typeof adminToTestAddress.result !== 'undefined' && (
                <>Result: {adminToTestAddress.result ? 'true' : 'false'}</>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
