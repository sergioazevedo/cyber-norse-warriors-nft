// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

// shold mint be free to owner only or public and payable
// should I have a function that allows the owner to:
// - increase the MAX_SUPPLY value
// - check the MAX_SUPPLY value
// - modifty the baseTokenURI so that the new token batch can use a new url for metadata
//   Example: initial supply 30 NTFs baseURI ipfs://bucket1
//      owner bumps supply to 50 NFTs baseURI ipfs://bucket-new then:
//          - we need to keep user ipfs://bucket1 until the initial suply is over (tokenId <= 30)
//          - we neee to start using ipfs://bucket-new as baseURI if tokenId > 30
// -------- look at batchnft.sol for insipiration

// contract CyberNorseWarriors is ERC721, ERC721URIStorage, Ownable {
contract CyberNorseWarriors is ERC721, Ownable {
    struct NFTBatch {
        uint256 maxSupply;
        string metadataURI;
    }

    uint256 private _lastTokenId;
    NFTBatch private _currentBatch;
    NFTBatch private _nextBatch;

    constructor(
        address deployAddress,
        uint256 initialSupply,
        string memory tokenMetadaURI
    ) ERC721("CyberNorseWarriors", "CNW") Ownable(deployAddress) {
        _currentBatch.maxSupply = initialSupply;
        _currentBatch.metadataURI = tokenMetadaURI;
    }

    function maxSupply() public view onlyOwner returns (uint256) {
        return _currentBatch.maxSupply;
    }

    function bumpSupply(
        uint256 newMaxSupply,
        string memory newMetadataURI
    ) public onlyOwner {
        require(
            _nextBatch.maxSupply == 0,
            "Supply bumps are currently locked!"
        );
        require(newMaxSupply > 0, "new supply must be greather than 0");
        require(
            bytes(newMetadataURI).length > 0,
            "metdata URI should be defined"
        );

        _nextBatch.maxSupply = newMaxSupply;
        _nextBatch.metadataURI = newMetadataURI;
    }

    // function safeMint(address to, string memory uri) public onlyOwner {
    //     uint256 tokenId = _lastTokenId++;
    //     _safeMint(to, tokenId);
    //     _setTokenURI(tokenId, uri);
    // }

    // // The following functions are overrides required by Solidity.

    // function tokenURI(
    //     uint256 tokenId
    // ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
    //     return super.tokenURI(tokenId);
    // }

    // function supportsInterface(
    //     bytes4 interfaceId
    // ) public view override(ERC721, ERC721URIStorage) returns (bool) {
    //     return super.supportsInterface(interfaceId);
    // }
}
