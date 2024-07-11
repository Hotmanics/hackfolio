// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/UserProfile.sol";
import "./mocks/MockErc721UriStorage.sol";

contract UserProfileTest is Test {
    UserProfile userProfile;

    MockErc721UriStorage mockErc721UriStorage;

    function setUp() public {
        mockErc721UriStorage = new MockErc721UriStorage();
        mockErc721UriStorage.mint(
            makeAddr("User"),
            "ipfs://QmZ6X4VwdowJVWYuR32A4duU4MXyc9P4pUVkCUdZHmh7vN"
        );

        userProfile = new UserProfile();
    }

    function testMessageOnDeployment() public {
        // console.log(mockErc721UriStorage.ownerOf(1));

        userProfile.setProfilePicTokenId(address(mockErc721UriStorage), 1);
    }
}
