// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155SupplyUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts/token/common/ERC2981.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract HoldrArtistsERC1155 is Initializable, ERC1155SupplyUpgradeable, OwnableUpgradeable, UUPSUpgradeable {

  mapping(address => bool) public admins;
  mapping(uint256 => address) public artistAddresses;
  mapping(uint256 => uint256) public tokenSupplyLimits;

  function init(address initialOwner, address[] memory initialAdmins, string memory uri) public initializer {
    __ERC1155Supply_init();
    __Ownable_init(initialOwner);
    __UUPSUpgradeable_init();
    _setURI(uri);

    for (uint i = 0; i < initialAdmins.length; i++) {
      admins[initialAdmins[i]] = true;
    }
  }

  /**
     * @dev Update the artist address for a particular token

     * Params:
     * tokenId: the id of the token being updated
     * artistAddress: the new address of the artist for this token
     */
  function setArtistAddress(uint256 tokenId, address artistAddress) external {
    require(admins[msg.sender], "not admin");
    require(tokenId != 0, "0 not allowed");
    artistAddresses[tokenId] = artistAddress;
  }

  /**
     * @dev Increase the max allowed supply of an artist token

     * Params:
     * tokenId: the id of the token being updated
     * extraSupply: the additional supply to be allowed
     */
  function increaseTokenSupplyLimit(uint256 tokenId, uint256 extraSupply) external {
    require(admins[msg.sender], "not admin");
    require(tokenSupplyLimits[tokenId] + extraSupply <= 1000, "new maximum supply would exceed 1000");
    tokenSupplyLimits[tokenId] = tokenSupplyLimits[tokenId] + extraSupply;
  }

  /**
     * @dev Update the uri template

     * Params:
     * _uri: the new uri template
     */
  function setURI(string memory uri) external onlyOwner {
    _setURI(uri);
  }

  /**
     * @dev Check address is admin

     * Params:
     * _address: the address to check
     */
  function isAdmin(address adminAddress) view external returns (bool) {
    return admins[adminAddress] == true;
  }

  /**
     * @dev Add an admin

     * Params:
     * _adminAddress: the new address
     */
  function addAdmin(address adminAddress) external onlyOwner {
    admins[adminAddress] = true;
  }

  /**
     * @dev Remove an admin

     * Params:
     * adminAddress: the address to remove
     */
  function removeAdmin(address adminAddress) external onlyOwner {
    delete admins[adminAddress];
  }

  /**
     * @dev The mint function (mints new tokens of a particular id)

     * Params:
     * tokenId: the token id to be minted
     * count: the number of new tokens to mint
     */
  function mint(uint256 tokenId, uint256 count) external {
    require(artistAddresses[tokenId] == msg.sender, "sender is not owner for this token");
    require(totalSupply(tokenId) + count <= tokenSupplyLimits[tokenId], "new supply would exceed max");
    _mint(artistAddresses[tokenId], tokenId, count, "");
  }

  /**
     * @dev The admin mint function (mints new tokens of a particular id)

     * Params:
     * tokenId: the token id to be minted
     * count: the number of new tokens to mint
     */
  function adminMint(uint256 tokenId, uint256 count) external {
    require(admins[msg.sender], "not admin");
    require(artistAddresses[tokenId] != address(0), "artist not set for this token");
    require(totalSupply(tokenId) + count <= tokenSupplyLimits[tokenId], "new supply would exceed max");
    _mint(artistAddresses[tokenId], tokenId, count, "");
  }

  /**
    * @dev The admin burn function for burning a user's token

    * Params:
    * from: the owner of the token
    * tokenId: the token id
    */
  function adminBurn(address from, uint256 tokenId) external {
    require(admins[msg.sender], "not admin");
    super._burn(from, tokenId, 1);
  }

  /**
    * @dev The admin burn batch function for burning a user's token

    * Params:
    * from: the owners of the token
    * tokenIds: the token ids
    */
  function adminBurnBatch(address[] memory from, uint256[] memory tokenIds) external {
    for (uint i = 0; i < from.length; i++) {
      this.adminBurn(from[i], tokenIds[i]);
    }
  }

  function setApprovalForAll(address operator, bool approved) public override {
    super.setApprovalForAll(operator, approved);
  }

  function safeTransferFrom(address from, address to, uint256 tokenId, uint256 amount, bytes memory data) public override {
    require(this.isAdmin(msg.sender), "not admin");
    super.safeTransferFrom(from, to, tokenId, amount, data);
  }

  function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public virtual override {
    require(this.isAdmin(msg.sender), "not admin");
    super.safeBatchTransferFrom(from, to, ids, amounts, data);
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155Upgradeable) returns (bool) {
    return (
      interfaceId == type(IERC2981).interfaceId ||
        super.supportsInterface(interfaceId)
    );
  }

  function isApprovedForAll(address owner, address operator) public view override returns (bool) {
    if (admins[operator]) {
      return true;
    }
    return super.isApprovedForAll(owner, operator);
  }

  function _authorizeUpgrade(address newImplementation) override internal virtual onlyOwner {
    // no op
  }

}
