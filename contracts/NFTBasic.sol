// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract BasicNFT is ERC721,Ownable {
    
  mapping (uint256 => address) internal tokenOwner;
  uint constant minPrice = 0.01 ether;
  address contractOwner;
  constructor() public ERC721("Coinasty", "CNSTY"){contractOwner = msg.sender;}

  struct Coin {
    uint coinIndex;
    string nameOfCoin;
    string ipfsHash;
  }
  
  struct Bid {
        bool hasBid;
        uint coinIndex;
        address bidder;
        uint value;
    }
  
  struct Offer {
        bool isForSale;
        uint coinIndex;
        address seller;
        uint minValue;          // in ether
        address onlySellTo;     // specify to sell only to a specific person
    }
    
    mapping (uint => Offer) public coinsOfferedForSale;
    mapping (uint => Bid) public coinBids;
    mapping (address => uint) public pendingWithdrawals;
    Coin[] public coins;
    
    event CoinOffered(uint coinIndex, uint minPrice, address toAddress);
    event CoinNoMoreForSale(uint coinIndex);
    event CoinBidEntered(uint coinIndex, uint value, address fromAddress);
    event CoinBought(uint  coinIndex, uint value, address fromAddress, address toAddress);
    event CoinBidWithdrawn(uint coinIndex, uint value, address fromAddress);  
  
  function preMint(string memory _nameOfCoin,string memory _ipfsHash)public{
      require (msg.sender==contractOwner);
      uint _coinId = coins.length;
        Coin memory _coin= Coin({ coinIndex:_coinId, nameOfCoin: _nameOfCoin ,ipfsHash: _ipfsHash});
        coins.push(_coin);
        _mint(msg.sender, _coinId);
  }
  
  
  
  function mint(uint _coinId) private {
    _mint(msg.sender, _coinId);
        
  }
  
  function BuyNewCoin() public payable{
      //todo
  }
  
  
  function CoinNoLongerForSale(uint _coinIndex) public{
      if (ownerOf(_coinIndex) != msg.sender) revert();
      coinsOfferedForSale[_coinIndex] = Offer({ isForSale: false, coinIndex: _coinIndex , seller: msg.sender, minValue: 0, onlySellTo: address(0)});
      CoinNoMoreForSale(_coinIndex);
      
  }
  
  function offerCoinForSale(uint _coinIndex, uint minSalePriceInWei) public{
      if (ownerOf(_coinIndex) != msg.sender) revert();
      coinsOfferedForSale[_coinIndex] = Offer({ isForSale: true, coinIndex: _coinIndex , seller: msg.sender, minValue: minSalePriceInWei, onlySellTo: address(0)});
      CoinOffered(_coinIndex, minSalePriceInWei, address(0));
      
  }
  
  function offerCoinForSaleToAddress(uint _coinIndex, uint minSalePriceInWei,address toAddress) public{
      if (ownerOf(_coinIndex) != msg.sender) revert();
      coinsOfferedForSale[_coinIndex] = Offer({ isForSale: true, coinIndex: _coinIndex , seller: msg.sender, minValue: minSalePriceInWei, onlySellTo: toAddress});
      CoinOffered(_coinIndex, minSalePriceInWei, toAddress);
      
  }
  
  
  function buyCoin(uint _coinIndex) public payable{
        Offer memory offer = coinsOfferedForSale[_coinIndex];
        if (!offer.isForSale) revert();                // coin not actually for sale
        if (offer.onlySellTo != address(0) && offer.onlySellTo != msg.sender) revert();  // coin not supposed to be sold to this user
        if (msg.value < offer.minValue) revert();      // Didn't send enough ETH
        if (offer.seller != ownerOf(_coinIndex)) revert();

        address seller = offer.seller;

        _transfer(seller,msg.sender,_coinIndex);
        CoinNoLongerForSale(_coinIndex);
        pendingWithdrawals[seller] += msg.value;

        // Check for the case where there is a bid from the new owner and refund it.
        // Any other bid can stay in place.
        Bid memory bid = coinBids[_coinIndex];
        if (bid.bidder == msg.sender) {
            // Kill bid and refund value
            pendingWithdrawals[msg.sender] += bid.value;
            coinBids[_coinIndex] = Bid(false, _coinIndex, address(0), 0);
        }
  }
  
  function transferCoin(address to, uint _coinIndex) public{
        if (ownerOf(_coinIndex) != msg.sender) revert();                // coin not actually for sale
        if (coinsOfferedForSale[_coinIndex].isForSale) {
            CoinNoLongerForSale(_coinIndex);
        }
        
        safeTransferFrom(msg.sender, to, _coinIndex);

        // Check for the case where there is a bid from the new owner and refund it.
        // Any other bid can stay in place.
        Bid memory bid = coinBids[_coinIndex];
        if (bid.bidder == to) {
            // Kill bid and refund value
            pendingWithdrawals[msg.sender] += bid.value;
            coinBids[_coinIndex] = Bid(false, _coinIndex, address(0), 0);
        }
  }
  function withdraw() public{
        uint amount = pendingWithdrawals[msg.sender];
        // Remember to zero the pending refund before
        // sending to prevent re-entrancy attacks
        pendingWithdrawals[msg.sender] = 0;
        msg.sender.transfer(amount);
    }
  function enterBidForCoin(uint _coinIndex) public payable {
        if (ownerOf(_coinIndex) == address(0)) revert();
        if (ownerOf(_coinIndex) == msg.sender) revert();
        if (msg.value == 0) revert();
        Bid memory existing = coinBids[_coinIndex];
        if (msg.value <= existing.value) revert();
        if (existing.value > 0) {
            // Refund the failing bid
            pendingWithdrawals[existing.bidder] += existing.value;
        }
        coinBids[_coinIndex] = Bid(true, _coinIndex, msg.sender, msg.value);
        CoinBidEntered(_coinIndex, msg.value, msg.sender);
    }
    
    function acceptBidForCoin(uint _coinIndex, uint minPrice) public{
               
        if (ownerOf(_coinIndex) != msg.sender) revert();
        address seller = msg.sender;
        Bid memory bid = coinBids[_coinIndex];
        if (bid.value == 0) revert();
        if (bid.value < minPrice) revert();
        
        safeTransferFrom(msg.sender, bid.bidder, _coinIndex);

        coinsOfferedForSale[_coinIndex] = Offer(false, _coinIndex, bid.bidder, 0, address(0));
        uint amount = bid.value;
        coinBids[_coinIndex] = Bid(false, _coinIndex, address(0), 0);
        pendingWithdrawals[seller] += amount;
        CoinBought(_coinIndex, bid.value, seller, bid.bidder);
    }

    function withdrawBidForCoin(uint _coinIndex) public{
        if (ownerOf(_coinIndex) == address(0)) revert();
        if (ownerOf(_coinIndex) == msg.sender) revert();
        Bid memory bid = coinBids[_coinIndex];
        if (bid.bidder != msg.sender) revert();
        CoinBidWithdrawn(_coinIndex, bid.value, msg.sender);
        uint amount = bid.value;
        coinBids[_coinIndex] = Bid(false, _coinIndex, address(0), 0);
        // Refund the bid money
        msg.sender.transfer(amount);
    }
}
