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
 Coin[] public coins;
  
  function mint(string memory _nameOfCoin) public { 
         require (msg.sender==contractOwner);
         uint _coinId = coins.length;
        Coin memory _coin= Coin({ coinIndex:_coinId, nameOfCoin: _nameOfCoin ,ipfsHash: ""});
        coins.push(_coin);
    _mint(msg.sender, _coinId);
        
  }
  
  function transferCoin(uint _coinIndex, address _coinBuyer)public{
      require (msg.sender==ownerOf(_coinIndex));
      safeTransferFrom(msg.sender, _coinBuyer, _coinIndex);
  } 
}
