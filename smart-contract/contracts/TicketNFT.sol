// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// Counters utility removed in OZ v5; using simple uint256 counter instead

/**
 * @title TicketNFT
 * @dev NFT Ticketing System - Each ticket is a unique ERC-721 token
 * @notice This contract allows event organizers to mint tickets as NFTs
 */
contract TicketNFT is ERC721, ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _tokenIdCounter;
    
    // Struct to store ticket/event details
    struct TicketDetails {
        uint256 eventId;
        string eventName;
        string eventDate;
        string venue;
        uint256 price; // Price in wei
        address originalOwner;
        uint256 mintedAt;
        bool isValid;
    }
    
    // Mapping from token ID to ticket details
    mapping(uint256 => TicketDetails) private _ticketDetails;
    
    // Mapping from event ID to array of token IDs
    mapping(uint256 => uint256[]) private _eventTickets;
    
    // Mapping to track total tickets per event
    mapping(uint256 => uint256) private _eventTicketCount;
    
    // Events
    event TicketMinted(
        uint256 indexed tokenId,
        address indexed owner,
        uint256 indexed eventId,
        string eventName,
        uint256 price
    );
    
    event TicketTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 eventId
    );
    
    event TicketInvalidated(uint256 indexed tokenId);
    
    constructor() ERC721("EventTicket", "ETIX") Ownable(msg.sender) {
        // Token counter starts at 1
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint a new ticket NFT
     * @param to Address to receive the ticket
     * @param eventId ID of the event
     * @param eventName Name of the event
     * @param eventDate Date of the event
     * @param venue Venue of the event
     * @param price Price of the ticket in wei
     * @param metadataURI Metadata URI for the NFT
     * @return tokenId The ID of the minted ticket
     */
    function mintTicket(
        address to,
        uint256 eventId,
        string memory eventName,
        string memory eventDate,
        string memory venue,
        uint256 price,
        string memory metadataURI
    ) public payable returns (uint256 tokenId) {
        require(to != address(0), "Cannot mint to zero address");
        require(msg.value >= price, "Insufficient payment");
        require(bytes(eventName).length > 0, "Event name required");
        
        tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        
        // Mint the NFT
        _safeMint(to, tokenId);
    _setTokenURI(tokenId, metadataURI);
        
        // Store ticket details
        _ticketDetails[tokenId] = TicketDetails({
            eventId: eventId,
            eventName: eventName,
            eventDate: eventDate,
            venue: venue,
            price: price,
            originalOwner: to,
            mintedAt: block.timestamp,
            isValid: true
        });
        
        // Track event tickets
        _eventTickets[eventId].push(tokenId);
        _eventTicketCount[eventId]++;
        
        emit TicketMinted(tokenId, to, eventId, eventName, price);
        
        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        return tokenId;
    }
    
    /**
     * @dev Transfer ticket to another address
     * @param to Recipient address
     * @param tokenId ID of the ticket to transfer
     */
    function transferTicket(address to, uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the ticket owner");
        require(to != address(0), "Cannot transfer to zero address");
        require(_ticketDetails[tokenId].isValid, "Ticket is not valid");
        
        address from = msg.sender;
        uint256 eventId = _ticketDetails[tokenId].eventId;
        
        // Transfer the NFT
        safeTransferFrom(from, to, tokenId);
        
        emit TicketTransferred(tokenId, from, to, eventId);
    }
    
    /**
     * @dev Get details of a specific ticket
     * @param tokenId ID of the ticket
     * @return eventId Event identifier
     * @return eventName Name of the event
     * @return eventDate Date of the event
     * @return venue Venue of the event
     * @return price Price paid (wei)
     * @return currentOwner Current NFT owner
     * @return originalOwner Address that originally minted the ticket
     * @return mintedAt Timestamp when minted
     * @return isValid Whether the ticket is still valid
     */
    function getTicketDetails(uint256 tokenId) public view returns (
        uint256 eventId,
        string memory eventName,
        string memory eventDate,
        string memory venue,
        uint256 price,
        address currentOwner,
        address originalOwner,
        uint256 mintedAt,
        bool isValid
    ) {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        
        TicketDetails memory ticket = _ticketDetails[tokenId];
        
        return (
            ticket.eventId,
            ticket.eventName,
            ticket.eventDate,
            ticket.venue,
            ticket.price,
            ownerOf(tokenId),
            ticket.originalOwner,
            ticket.mintedAt,
            ticket.isValid
        );
    }
    
    /**
     * @dev Get all tickets for a specific event
     * @param eventId ID of the event
     * @return Array of token IDs
     */
    function getEventTickets(uint256 eventId) public view returns (uint256[] memory) {
        return _eventTickets[eventId];
    }
    
    /**
     * @dev Get total ticket count for an event
     * @param eventId ID of the event
     * @return Total number of tickets
     */
    function getEventTicketCount(uint256 eventId) public view returns (uint256) {
        return _eventTicketCount[eventId];
    }
    
    /**
     * @dev Get all tickets owned by an address
     * @param owner Address to query
     * @return Array of token IDs
     */
    function getTicketsByOwner(address owner) public view returns (uint256[] memory) {
        uint256 balance = balanceOf(owner);
        uint256[] memory tickets = new uint256[](balance);
        uint256 counter = 0;
        
        // Iterate through all minted tokens
    for (uint256 i = 1; i < _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tickets[counter] = i;
                counter++;
                if (counter >= balance) break;
            }
        }
        
        return tickets;
    }
    
    /**
     * @dev Verify if a ticket is valid and owned by the specified address
     * @param tokenId ID of the ticket
     * @param owner Address to verify
     * @return bool True if ticket is valid and owned by the address
     */
    function verifyTicket(uint256 tokenId, address owner) public view returns (bool) {
        if (_ownerOf(tokenId) == address(0)) return false;
        if (!_ticketDetails[tokenId].isValid) return false;
        return ownerOf(tokenId) == owner;
    }
    
    /**
     * @dev Invalidate a ticket (only owner can call)
     * @param tokenId ID of the ticket to invalidate
     */
    function invalidateTicket(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Ticket does not exist");
        _ticketDetails[tokenId].isValid = false;
        emit TicketInvalidated(tokenId);
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get current token counter value
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // The following functions are overrides required by Solidity
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
