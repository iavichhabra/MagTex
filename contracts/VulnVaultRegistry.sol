// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VulnVaultRegistry is ReentrancyGuard {
    struct Listing {
        address seller;
        address ipId;
        string cdrUUID;
        uint256 price;
        string metadataURI;
        bool active;
        uint256 licenseTermsId;
        uint256 createdAt;
    }

    struct Review {
        address reviewer;
        uint8 rating;
        string comment;
        uint256 timestamp;
    }

    uint256 public listingCounter;
    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public ipIdToListing;
    mapping(address => uint256[]) public sellerListings;
    mapping(address => mapping(uint256 => bool)) public hasAccess;
    mapping(uint256 => Review[]) public listingReviews;
    mapping(address => uint256) public reputationScore;
    mapping(address => uint256) public totalEarnings;
    mapping(address => uint256) public totalTips;

    event ReportListed(
        uint256 indexed id,
        address indexed seller,
        address indexed ipId,
        uint256 price,
        string cdrUUID
    );
    event ReportPurchased(uint256 indexed id, address indexed buyer, uint256 amount);
    event AccessGranted(uint256 indexed id, address indexed buyer);
    event TipSent(address indexed researcher, address indexed buyer, uint256 amount);
    event ReviewSubmitted(uint256 indexed id, address indexed reviewer, uint8 rating);

    function listReport(
        address ipId,
        string calldata cdrUUID,
        uint256 price,
        string calldata metadataURI,
        uint256 licenseTermsId
    ) external returns (uint256) {
        uint256 id = ++listingCounter;
        listings[id] = Listing({
            seller: msg.sender,
            ipId: ipId,
            cdrUUID: cdrUUID,
            price: price,
            metadataURI: metadataURI,
            active: true,
            licenseTermsId: licenseTermsId,
            createdAt: block.timestamp
        });
        ipIdToListing[ipId] = id;
        sellerListings[msg.sender].push(id);
        reputationScore[msg.sender]++;

        emit ReportListed(id, msg.sender, ipId, price, cdrUUID);
        return id;
    }

    function purchaseReport(uint256 id) external payable nonReentrant {
        Listing storage listing = listings[id];
        require(listing.active, "INACTIVE");
        require(msg.value >= listing.price, "INSUFFICIENT");
        require(!hasAccess[msg.sender][id], "ALREADY_OWNED");
        require(listing.seller != msg.sender, "SELF_PURCHASE");

        hasAccess[msg.sender][id] = true;
        totalEarnings[listing.seller] += msg.value;

        (bool success, ) = payable(listing.seller).call{value: msg.value}("");
        require(success, "TRANSFER_FAIL");

        emit ReportPurchased(id, msg.sender, msg.value);
        emit AccessGranted(id, msg.sender);
    }

    function sendTip(address researcher) external payable nonReentrant {
        require(msg.value > 0, "ZERO_TIP");
        totalTips[researcher] += msg.value;
        totalEarnings[researcher] += msg.value;

        (bool success, ) = payable(researcher).call{value: msg.value}("");
        require(success, "TRANSFER_FAIL");

        emit TipSent(researcher, msg.sender, msg.value);
    }

    function submitReview(
        uint256 id,
        uint8 rating,
        string calldata comment
    ) external {
        require(hasAccess[msg.sender][id], "NO_ACCESS");
        require(rating > 0 && rating <= 5, "INVALID_RATING");

        listingReviews[id].push(
            Review({
                reviewer: msg.sender,
                rating: rating,
                comment: comment,
                timestamp: block.timestamp
            })
        );

        emit ReviewSubmitted(id, msg.sender, rating);
    }

    function deactivateListing(uint256 id) external {
        require(listings[id].seller == msg.sender, "UNAUTHORIZED");
        listings[id].active = false;
    }

    function getListingReviews(uint256 id) external view returns (Review[] memory) {
        return listingReviews[id];
    }

    function getSellerListings(address seller) external view returns (uint256[] memory) {
        return sellerListings[seller];
    }

    function getBuyerListings(address buyer) external view returns (uint256[] memory) {
        uint256[] memory owned = new uint256[](listingCounter);
        uint256 count = 0;
        for (uint256 i = 1; i <= listingCounter; i++) {
            if (hasAccess[buyer][i]) {
                owned[count] = i;
                count++;
            }
        }
        assembly {
            mstore(owned, count)
        }
        return owned;
    }

    receive() external payable {
        revert("NO_DIRECT_SEND");
    }
}
