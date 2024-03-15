import {
  BuildingOfficeIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/20/solid'
import clsx from 'clsx'
import React from 'react'

export function ContractAdminTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: string
  onTabChange: (tab: string) => void
}) {
  const tabs = [
    { name: 'artists', label: 'Artists', icon: UserIcon },
    { name: 'admins', label: 'Admins', icon: UsersIcon },
    {
      name: 'contract_upgrade',
      label: 'Contract Upgrade',
      icon: BuildingOfficeIcon,
    },
  ]

  const handleTabChange = (t: string) => {
    onTabChange(t)
  }

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = tab.name === activeTab
            return (
              <button
                key={tab.name}
                //   href={tab.href}
                onClick={() => handleTabChange(tab.name)}
                className={clsx(
                  isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <tab.icon
                  className={clsx(
                    isActive
                      ? 'text-indigo-500'
                      : 'text-gray-400 group-hover:text-gray-500',
                    '-ml-0.5 mr-2 h-5 w-5',
                  )}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
