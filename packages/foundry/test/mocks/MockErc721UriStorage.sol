//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "forge-std/interfaces/IERC721.sol";

import {ERC721, ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MockErc721UriStorage is ERC721URIStorage {
    constructor() ERC721("Test NFT", "TNFT") {}

    uint256 tokenCount;

    function mint(address target, string memory tokenUri) public {
        _mint(target, tokenCount);
        _setTokenURI(tokenCount, tokenUri);
        tokenCount++;
    }
}
