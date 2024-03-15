import { upgrades } from 'hardhat'
import type { DeployFunction } from 'hardhat-deploy/types'

import { HoldrArtistsERC1155__factory } from '../typechain'

const deployFunction: DeployFunction = async ({ ethers }) => {
  const [deployer, admin1] = await ethers.getSigners()

  const holdrArtistsERC1155Factory = await ethers.getContractFactory(
    'HoldrArtistsERC1155',
    deployer,
  )

  const firstImplementation = await holdrArtistsERC1155Factory.deploy()
  const proxyContract = await (
    await ethers.getContractFactory('ERC1967Proxy', deployer)
  ).deploy(
    await firstImplementation.getAddress(),
    HoldrArtistsERC1155__factory.createInterface().encodeFunctionData('init', [
      deployer.address,
      [admin1.address],
      'https://preview-example.vercel.app/api/metadata/{id}.json',
    ]),
  )

  console.log('deployedProxy:', await proxyContract.getAddress())
  console.log(
    'getImplementationAddress',
    await upgrades.erc1967.getImplementationAddress(
      await proxyContract.getAddress(),
    ),
  )
}

export default deployFunction
