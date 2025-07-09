// contracts/IDRX.sol - Versi yang benar-benar fixed
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract IDRX is ERC20, Ownable, ERC20Permit {

    // Declare decimals as state variable untuk memastikan override bekerja1
    uint8 private _decimals = 2;

    constructor(address recipient, address initialOwner)
        ERC20("IDRX", "IDRX")
        Ownable(initialOwner)
        ERC20Permit("IDRX")
    {
        // Mint dengan explicit decimals
        _mint(recipient, 100000 * (10 ** _decimals));
    }

    // Override decimals function dengan implementation yang benar
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}