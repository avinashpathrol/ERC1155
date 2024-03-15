// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./HoldrArtistsERC1155.sol";

contract HoldrArtistsERC1155UpgradeTest is HoldrArtistsERC1155 {

  function supportsInterface(bytes4 interfaceId) public view virtual override(HoldrArtistsERC1155) returns (bool) {
    revert("This is a dummy error");
  }

}
