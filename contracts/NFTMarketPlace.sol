// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// INTERNAL IMPORT FOR NFT OPENZEPPELIN
import "@openzeppelin/contracts/utils/Counters.sol"; // using as a counter
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace is ERC721URIStorage {
    // Counter using for counting up in the contract
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.0015 ether;

    address payable owner;

    mapping(uint256 => MarketItem) private idMarketItem;

    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    event idMarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    /*  Modifier  */
    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only Owner of the marketplace can call this function!"
        );
        _;
    }

    // initialization the NFT name and token name
    constructor() ERC721("NFT Metavarse Dev Token", "DEVNFT") {
        owner = payable(msg.sender);
    }

    // @dev function to update listing price
    // @param _listingPrice: that is new update listing price
    function updateListingPrice(
        uint256 _listingPrice
    ) public payable onlyOwner {
        listingPrice = _listingPrice;
    }

    // @dev function to getlisting price
    // return listingPrice
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    /*
        CREATE NFT TOKEN FUNCTION
     */

    // @dev function to create token
    // return new token Id
    function createToken(
        string memory tokenURI,
        uint256 price
    ) public payable returns (uint256) {
        _tokenIds.increment(); // increate the number of tokenId

        uint256 newTokenId = _tokenIds.current();

        // mint NFT function
        _mint(msg.sender, newTokenId);

        // set Token URI
        _setTokenURI(newTokenId, tokenURI);

        //create market item
        createMarketItem(newTokenId, price);

        return newTokenId;
    }

    // @dev function to create the market item and add to mapping idMarketItem
    //      transfer the owner to the contract
    function createMarketItem(uint256 tokenId, uint256 price) private {
        require(price > 0, "Price must be atleast 1");
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // adds Market item to mapping idMarketItem
        idMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)), // owner is address contract
            price,
            false
        );

        // transfer tokenId to market
        _transfer(msg.sender, address(this), tokenId);

        emit idMarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false
        );
    }

    /* FUNCTION TO RESALE TOKEN */

    /// @dev function to resell the token
    /// @param tokenId and price
    function reSellToken(uint256 tokenId, uint256 price) public payable {
        require(
            idMarketItem[tokenId].owner == msg.sender,
            "Only item owner can perform this operation"
        );

        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // update the idMarketItem of this tokenId data
        idMarketItem[tokenId].sold = false;
        idMarketItem[tokenId].price = price;
        idMarketItem[tokenId].seller = payable(msg.sender);
        idMarketItem[tokenId].owner = payable(address(this));

        _itemsSold.decrement();

        _transfer(msg.sender, address(this), tokenId);
    }

    /// @dev function to create market sale and transfer data to new owner, remove tokenId in Market
    function createMarketSales(uint256 tokenId) public payable {
        uint256 price = idMarketItem[tokenId].price;

        require(
            msg.value == price,
            "Please submit the correct price to complete the process"
        );

        idMarketItem[tokenId].owner = payable(msg.sender);
        idMarketItem[tokenId].sold = true;
        idMarketItem[tokenId].owner = payable(address(0)); // the NFT not belong to the contract

        _itemsSold.increment();

        // transfer the tokenId from contract to person who call this function
        _transfer(address(this), msg.sender, tokenId);

        // transfer the listingPrice to the contract
        payable(owner).transfer(listingPrice);

        // transfer the NFT price which purchage by new owner to the seller
        payable(idMarketItem[tokenId].seller).transfer(msg.value);
    }

    /// @dev function to get unsold NFT data from tokenId is 1 and 
    function fetchMarketItem() public view returns(MarketItem[] memory) {
        uint256 itemCount = _tokenIds.current();
        uint256 unSoldItemCount = _tokenIds.current() - _itemsSold.current();
        uint256 currentIndex = 0;

        // create new for all NFTs which not sold
        MarketItem[] memory items = new MarketItem[](unSoldItemCount);

        for (uint256 i = 0; i < itemCount; i++) {
            // check if onwer NFT is address of this contract => this NFT is not sold
            if (idMarketItem[i + 1].owner == address(this)) { // run from 1 because initialization the value of tokenId is 0 and then mint new tokenId it count to 1
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex +=1;
            }
        }
        return items;
    }

    /// @dev function to purchase item of each user
    function fetchMyNFT() public view returns(MarketItem[] memory) {
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (idMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        // create new for all NFTs which belong to user
        MarketItem[] memory items = new MarketItem[](itemCount);

        for (uint256 i = 0; i < totalCount; i++){

            if (idMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }

    /// @dev function to get single user items (items of seller)
        function fetchItemsListed() public view returns (MarketItem[] memory) {
        uint256 totalCount = _tokenIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalCount; i++) {
            if (idMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalCount; i++) {
            if (idMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = i + 1;

                MarketItem storage currentItem = idMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}
