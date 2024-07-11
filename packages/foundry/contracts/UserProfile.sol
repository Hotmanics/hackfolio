//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";
import "forge-std/interfaces/IERC721.sol";

contract UserProfile {
    struct User {
        string name;
        address erc721Collection;
        uint256 profilePicTokenId;
        string username;
        string xUrl;
        string warpcastUrl;
        string linkedinUrl;
        string redditUrl;
        string instagramUrl;
        string otherUrl;
        string email;
    }

    mapping(address => User) s_user;

    function getUser(address addr) external view returns (User memory user) {
        return s_user[addr];
    }

    function validateUserProfilePic(address user) external {
        if (
            IERC721(s_user[user].erc721Collection).ownerOf(
                s_user[user].profilePicTokenId
            ) == user
        ) {
            revert(); //Pic is valid, no need to make any changes
        }

        s_user[user].erc721Collection = address(0);
        s_user[user].profilePicTokenId = 0;
    }

    function setProfileName(string memory name) external {
        s_user[msg.sender].name = name;
    }

    function setProfilePicTokenId(
        address collection,
        uint256 profilePicTokenId
    ) external {
        if (IERC721(collection).ownerOf(profilePicTokenId) != msg.sender) {
            revert();
        }

        s_user[msg.sender].erc721Collection = collection;
        s_user[msg.sender].profilePicTokenId = profilePicTokenId;
    }
}
