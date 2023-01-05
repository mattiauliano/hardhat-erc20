// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Once installed the library you can import every openZeppelin contract
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract FailureToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("FailureToken", "FAIL") {
        // Create tokens with mint function
        _mint(msg.sender, initialSupply);
    }
}
