import '@nomiclabs/hardhat-ethers'

import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import hre, { ethers, upgrades } from 'hardhat'

import type {
  HoldrArtistsERC1155,
  HoldrArtistsERC1155UpgradeTest,
} from '../../typechain'
import { HoldrArtistsERC1155__factory } from '../../typechain'

chai.use(chaiAsPromised)
const { expect } = chai

const expectError = async (
  f: () => Promise<unknown>,
  errorStringFilter: string,
  failReason: string,
) => {
  try {
    await f()
    expect.fail(failReason)
  } catch (e: any) {
    if (e.toString().indexOf(errorStringFilter) === -1) {
      expect.fail(
        `This should have thrown a different error. Got: ${e.message}`,
      )
    }
  }
}

const ERC165_ID = '0x01ffc9a7'
const ERC2981_ID = '0x2a55205a'
const ERC1155_ID = '0xd9b67a26'

describe('HoldrArtistsERC1155', () => {
  // let holdrArtistsERC1155Proxy: HoldrContractProxy
  let holdrArtistsERC1155: HoldrArtistsERC1155
  let admin1: HardhatEthersSigner
  let artist1: HardhatEthersSigner
  let artist2: HardhatEthersSigner
  let owner: HardhatEthersSigner
  let user1: HardhatEthersSigner

  let upgradedImplementation: HoldrArtistsERC1155UpgradeTest | undefined =
    undefined

  beforeEach(async () => {
    await hre.network.provider.send('hardhat_reset', [])
    const signers = await ethers.getSigners()
    admin1 = signers[0]
    owner = signers[1]
    artist1 = signers[2]
    artist2 = signers[3]
    user1 = signers[4]

    const holdrArtistsERC1155Factory = await ethers.getContractFactory(
      'HoldrArtistsERC1155',
      owner,
    )

    const holdrArtistsERC1155UpgradeTestFactory =
      await ethers.getContractFactory('HoldrArtistsERC1155UpgradeTest', owner)

    const firstImplementation = await holdrArtistsERC1155Factory.deploy()

    upgradedImplementation =
      await holdrArtistsERC1155UpgradeTestFactory.deploy()

    const proxyContractFactory = await ethers.getContractFactory(
      'ERC1967Proxy',
      owner,
    )

    const proxyContract = await proxyContractFactory.deploy(
      await firstImplementation.getAddress(),
      HoldrArtistsERC1155__factory.createInterface().encodeFunctionData(
        'init',
        [
          owner.address,
          [admin1.address],
          'https://preview-example.vercel.app/api/metadata/{id}.json',
        ],
      ),
    )

    holdrArtistsERC1155 = HoldrArtistsERC1155__factory.connect(
      await proxyContract.getAddress(),
      owner,
    )

    const tx2 = await holdrArtistsERC1155
      .connect(admin1)
      .setArtistAddress(1, artist1.address)

    const tx3 = await holdrArtistsERC1155
      .connect(admin1)
      .setArtistAddress(2, artist2.address)

    await Promise.all([tx2.wait(), tx3.wait()])
  })

  describe('uri', () => {
    it('should report the correct uri', async () => {
      const uri = await holdrArtistsERC1155.connect(owner).uri(1)
      expect(uri).to.eq(
        'https://preview-example.vercel.app/api/metadata/{id}.json',
      )
    })

    it('should allow updating the uri by owner', async () => {
      await holdrArtistsERC1155
        .connect(owner)
        .setURI('https://preview-example.vercel.app/should_work/{id}.json')
      const uri = await holdrArtistsERC1155.connect(owner).uri(1)
      expect(uri).to.eq(
        'https://preview-example.vercel.app/should_work/{id}.json',
      )
    })

    it('should not allow updating the uri by non-owner', async () => {
      try {
        await holdrArtistsERC1155
          .connect(admin1)
          .setURI(
            'https://preview-example.vercel.app/should_not_work/{id}.json',
          )
      } catch (e: any) {
        if (e.toString().indexOf('OwnableUnauthorizedAccount') === -1) {
          expect.fail(
            `This should have thrown a different error. Got: ${e.message}`,
          )
        }
      }
    })
  })

  describe('upgrades', () => {
    it('should upgrade the implementation', async () => {
      const tx =
        upgradedImplementation &&
        (await holdrArtistsERC1155.upgradeToAndCall(
          await upgradedImplementation.getAddress(),
          new Uint8Array([]),
        ))

      await tx?.wait()

      expect(
        await upgrades.erc1967.getImplementationAddress(
          await holdrArtistsERC1155.getAddress(),
        ),
      ).to.equal(await upgradedImplementation?.getAddress())

      expect(
        await upgrades.erc1967.getImplementationAddress(
          await holdrArtistsERC1155.getAddress(),
        ),
      ).to.equal(await holdrArtistsERC1155.implementation())

      await expectError(
        () => holdrArtistsERC1155.supportsInterface('0x00000000'),
        'This is a dummy error',
        'Contract does not appear to have been upgraded (`supportsInterface` does not throw dummy error).',
      )

      expect(await tx?.confirmations()).to.be.greaterThan(0)
      expect(await holdrArtistsERC1155.isAdmin(admin1)).to.equal(true)
      expect(await holdrArtistsERC1155.isAdmin(artist1)).to.equal(false)
    })
  })

  describe('admins', () => {
    it('should report the deployer as admin', async () => {
      expect(await holdrArtistsERC1155.isAdmin(admin1.address)).to.eq(true)
    })
  })

  describe('transferring ownership', () => {
    it('should allow transferring of ownership by current owner', async () => {
      const tx = await holdrArtistsERC1155
        .connect(owner)
        .transferOwnership(admin1.address)

      expect(await tx.confirmations()).to.be.gt(0)
    })
  })

  describe('admin approval', () => {
    it('should allow admin to transfer token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)

      const tx = await holdrArtistsERC1155
        .connect(admin1)
        .safeTransferFrom(artist1.address, user1.address, 1, 1, '0x')

      expect(await tx.confirmations()).to.be.gt(0)
    })

    it('should not allow non-admin to transfer token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)

      await expectError(
        () =>
          holdrArtistsERC1155
            .connect(user1)
            .safeTransferFrom(artist1.address, user1.address, 1, 1, '0x'),
        'not admin',
        'Transfer succeeded when it should have failed (not admin).',
      )
    })

    it('should not allow holder to transfer token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      const mintTx = await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)
      expect(await mintTx.confirmations()).to.be.gt(0)

      await expectError(
        () =>
          holdrArtistsERC1155
            .connect(artist1)
            .safeTransferFrom(artist1.address, user1.address, 1, 1, '0x'),
        'not admin',
        'Transfer succeeded when it should have failed (not admin).',
      )
    })

    it('should allow admin to burn token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)

      const tx = await holdrArtistsERC1155
        .connect(admin1)
        .adminBurn(artist1.address, 1)

      expect(await tx.confirmations()).to.be.gt(0)
    })

    it('should not allow non-admin to burn token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      const mintTx = await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)
      expect(await mintTx.confirmations()).to.be.gt(0)

      await expectError(
        () =>
          holdrArtistsERC1155.connect(artist1).adminBurn(artist1.address, 1),
        'not admin',
        'Transfer succeeded when it should have failed (not admin).',
      )
    })

    it('should not allow holder to burn token arbitrarily', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      const mintTx = await holdrArtistsERC1155.connect(admin1).adminMint(1, 1)
      expect(await mintTx.confirmations()).to.be.gt(0)

      await expectError(
        () =>
          holdrArtistsERC1155.connect(artist1).adminBurn(artist1.address, 1),
        'not admin',
        'Transfer succeeded when it should have failed (not admin).',
      )
    })
  })

  describe('artist operations', () => {
    it('should allow artist to mint a token', async () => {
      await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      await holdrArtistsERC1155.connect(artist1).mint(1, 1)
      expect(await holdrArtistsERC1155['totalSupply(uint256)'](1)).to.equal(1)
    })

    it('should not allow artist to mint a token when totalSupply = maxSupply', async () => {
      // await holdrArtistsERC1155.connect(admin1).increaseTokenSupplyLimit(1, 1)
      // await holdrArtistsERC1155.connect(artist1).mint(1, 1)
      expect(await holdrArtistsERC1155['totalSupply(uint256)'](1)).to.equal(0)
      await expectError(
        () => holdrArtistsERC1155.connect(artist1).mint(1, 1),
        'new supply would exceed max',
        'Mint succeeded when it should have failed (max supply reached).',
      )
    })
  })

  describe('Royalties (ERC2981)', () => {
    // TODO: royalty amount is reported correctly
    // TODO: royalty can be updated by owner
    // TODO: royalty cannot be updated by non-owner
  })

  describe('ERC165', () => {
    it('correctly reports support for ERC165', async () => {
      expect(await holdrArtistsERC1155.supportsInterface(ERC165_ID)).to.eq(true)
    })
    it('correctly reports support for ERC2981', async () => {
      expect(await holdrArtistsERC1155.supportsInterface(ERC2981_ID)).to.eq(
        true,
      )
    })
    it('correctly reports support for ERC1155', async () => {
      expect(await holdrArtistsERC1155.supportsInterface(ERC1155_ID)).to.eq(
        true,
      )
    })
    it('correctly reports no support for imaginary interface id', async () => {
      expect(await holdrArtistsERC1155.supportsInterface('0x33333333')).to.eq(
        false,
      )
    })
  })
})
