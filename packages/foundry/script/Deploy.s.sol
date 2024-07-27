//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/YourContract.sol";
import "./DeployHelpers.s.sol";
import "../contracts/UserProfile.sol";
import {MockErc721UriStorage} from "../test/mocks/MockErc721UriStorage.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);

        MockErc721UriStorage mockErc721UriStorage = new MockErc721UriStorage();
        mockErc721UriStorage.mint(
            0xc12935f79B9b10A151129ec9a54745d3b017ff4b,
            "ipfs://QmZ6X4VwdowJVWYuR32A4duU4MXyc9P4pUVkCUdZHmh7vN"
        );

        mockErc721UriStorage.mint(
            0xc12935f79B9b10A151129ec9a54745d3b017ff4b,
            "ipfs://QmZjGDbEYBMc8k4aQY78PxJtt1Hqw4ErG8jMjLfy1h3xzu"
        );

        // mockErc721UriStorage.mint(0x42bcD9e66817734100b86A2bab62d9eF3B63E92A);

        new UserProfile();

        // YourContract yourContract = new YourContract(
        //     vm.addr(deployerPrivateKey)
        // );
        // console.logString(
        //     string.concat(
        //         "YourContract deployed at: ",
        //         vm.toString(address(yourContract))
        //     )
        // );

        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function test() public {}
}
