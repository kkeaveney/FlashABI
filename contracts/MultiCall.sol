//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC20 {
    function withdraw(
        address from,
        address to,
        uint256 amount
    ) external returns (uint256);

    function balanceOf(address _account) external returns (uint256);
}

contract MultiCall {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function executeCalls(address[] memory _targets, bytes[] calldata _data)
        public
    {
        require(
            _targets.length == _data.length,
            "target length doesn't match data length"
        );
        for (uint256 i; i < _targets.length; i++) {
            (bool success, bytes memory result) = _targets[i].call(_data[i]);
            require(success, "Call failed");
        }
    }

    function withdraw(address _token, uint256 _amount) public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(
            IERC20(_token).balanceOf(msg.sender) >= _amount,
            "Insufficient funds"
        );
        IERC20(_token).withdraw(address(this), msg.sender, _amount);
    }
}
