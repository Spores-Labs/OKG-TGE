// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetFixedSupply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OKGToken is ERC20PresetFixedSupply, Ownable {
    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) 
        ERC20PresetFixedSupply(_name, _symbol, _initialSupply, _msgSender())
    {}
}
