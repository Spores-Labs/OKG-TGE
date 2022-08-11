// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OKGToken is ERC20Burnable, Pausable, Ownable {
    mapping(address => bool) public blacklisted;
    mapping(address => bool) public whitelisted;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply
    ) ERC20(_name, _symbol) {
        _mint(_msgSender(), _initialSupply);
    }

    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }

    /**
     * @dev Pauses all token transfers.
     * Requirements:
     * - the caller must must be owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     * Requirements:
     * - the caller must be owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Blacklist user to prevent transfer
     * Requirements:
     * - the caller must be owner.
     */
    function blacklist(address _user, bool _isBlacklisted) external onlyOwner {
        blacklisted[_user] = _isBlacklisted;
    }

    /**
     * @dev Whitelist user to allow transfer even when paused
     * Requirements:
     * - the caller must be owner.
     */
    function whitelist(address _user, bool _isWhitelisted) external onlyOwner {
        whitelisted[_user] = _isWhitelisted;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20) {
        require(!(blacklisted[from] || blacklisted[to]), "Transfer blacklisted");
        require(!paused() || whitelisted[_msgSender()], "Transfer paused");
        super._beforeTokenTransfer(from, to, amount);
    }
}
