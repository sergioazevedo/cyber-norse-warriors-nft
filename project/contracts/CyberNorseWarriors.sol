// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CyberNorseWarriors is ERC721, Ownable {
    constructor() ERC721("CyberNorseWarriors", "CNW") {}

    function _baseURI() internal pure override returns (string memory) {
        return
            "https://gateway.pinata.cloud/ipfs/QmVEqAfVqNe2K9s8FLjkAnrwGDk2nVzwNVQFC7y4Svq3Ba/";
    }
}
