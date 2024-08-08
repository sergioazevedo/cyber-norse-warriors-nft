// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

// Desired functionalities:
// - increase the MAX_SUPPLY value (only Owner) ✅
// - check the MAX_SUPPLY value ✅
// - allow the baseTokenURI to be changed so that the new token batch can use a new url for metadata ✅
//   Example: initial supply 30 NTFs baseURI ipfs://bucket1
//      owner bumps supply to 50 NFTs baseURI ipfs://bucket-new then:
//          - we need to keep user ipfs://bucket1 until the initial suply is over (tokenId <= 30) ✅
//          - we neee to start using ipfs://bucket-new as baseURI if tokenId > 30 ✅

contract CyberNorseWarriors is ERC721, ERC721URIStorage, Ownable {
    struct NFTBatch {
        uint256 startFrom;
        string metadataURI;
    }

    event NFTBatchAdded(uint256 maxSupply, string metadataURI);

    uint256 private _maxSupply;
    uint256 private _lastTokenId;
    NFTBatch private _currentBatch;
    NFTBatch private _nextBatch;

    uint256 private _mintPrice = 0.003 ether;

    constructor(
        address deployAddress,
        uint256 initialSupply,
        string memory tokenMetadaURI
    ) ERC721("CyberNorseWarriors", "CNW") Ownable(deployAddress) {
        _maxSupply = initialSupply;
        _currentBatch.startFrom = 0;
        _currentBatch.metadataURI = tokenMetadaURI;
    }

    function maxSupply() public view onlyOwner returns (uint256) {
        return _maxSupply;
    }

    function bumpSupplyAvaiable() external view onlyOwner returns (bool) {
        return _nextBatch.startFrom == 0;
    }

    function bumpSupply(
        uint256 newSupplySize,
        string memory newMetadataURI
    ) public onlyOwner {
        require(
            _nextBatch.startFrom == 0,
            "Supply bumps are currently locked!"
        );
        require(newSupplySize > 0, "new supply must be greather than 0");
        require(
            bytes(newMetadataURI).length > 0,
            "metdata URI should be defined"
        );

        _nextBatch.startFrom = _maxSupply + 1;
        _nextBatch.metadataURI = newMetadataURI;
        _maxSupply += newSupplySize;

        emit NFTBatchAdded(newSupplySize, newMetadataURI);
    }

    function safeMint(address to) public payable {
        require(
            maxSupply() >= (_lastTokenId + 1),
            "Sorry, all items are gone."
        );
        require(msg.value >= _mintPrice, "Insufient Funds");

        uint256 tokenId = _lastTokenId += 1;

        // //check if we need to rotate NFT Batches
        if ((_nextBatch.startFrom > 0) && (_nextBatch.startFrom == tokenId)) {
            rotateCurrentBatch();
        }
        super._safeMint(to, tokenId);
        super._setTokenURI(tokenId, _currentBatch.metadataURI);
    }

    function rotateCurrentBatch() internal {
        // rotate _currentBatch
        _currentBatch.startFrom = _nextBatch.startFrom;
        _currentBatch.metadataURI = _nextBatch.metadataURI;

        // clears _nextBatch
        _nextBatch.metadataURI = "";
        _nextBatch.startFrom = 0;
    }

    //// The following functions are overrides required by Solidity.

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
