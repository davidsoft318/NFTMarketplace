pragma solidity >=0.7.0 <0.9.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v3.4.0-solc-0.7/contracts/access/Ownable.sol";
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
    Bid[] public coinBids;
    Coin[] public coins;
    
    event CoinOffered(uint coinIndex, uint minPrice, address toAddress);
  
  function mint(string memory _nameOfCoin) public { 
         require (msg.sender==contractOwner);
         uint _coinId = coins.length;
        Coin memory _coin= Coin({ coinIndex:_coinId, nameOfCoin: _nameOfCoin ,ipfsHash: ""});
        coins.push(_coin);
    _mint(msg.sender, _coinId);
        
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
  
  function transferCoin(uint _coinIndex, address _coinBuyer)public{
      require (msg.sender==ownerOf(_coinIndex));
      safeTransferFrom(msg.sender, _coinBuyer, _coinIndex);
  } 
  
  
}