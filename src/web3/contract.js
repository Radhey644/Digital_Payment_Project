import { ethers } from 'ethers';
import contractABI from './contractABI.json';

// Contract configuration
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';
const MUMBAI_RPC_URL = import.meta.env.VITE_MUMBAI_RPC_URL || 'https://polygon-mumbai-bor-rpc.publicnode.com';

// Get contract instance with signer
export const getContract = async (signer) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  // Ensure contract is deployed on the current network
  try {
    const prov = signer.provider || new ethers.BrowserProvider(window.ethereum);
    const code = await prov.getCode(CONTRACT_ADDRESS);
    if (!code || code === '0x') {
      throw new Error('Contract not found on this network. Make sure Hardhat node is running and the contract is deployed to localhost.');
    }
  } catch (e) {
    // Rethrow with friendly message
    throw e;
  }

  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);
};

// Get contract instance with provider (read-only)
export const getContractReadOnly = async () => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }

  const provider = new ethers.JsonRpcProvider(MUMBAI_RPC_URL);
  const code = await provider.getCode(CONTRACT_ADDRESS);
  if (!code || code === '0x') {
    throw new Error('Contract not found at configured address on the connected RPC. Check .env VITE_CONTRACT_ADDRESS and redeploy to localhost if needed.');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
};

/**
 * Mint a new ticket NFT
 */
export const mintTicket = async (signer, eventData) => {
  try {
    const contract = await getContract(signer);
    
    const {
      to,
      eventId,
      eventName,
      eventDate,
      venue,
      price,
      tokenURI = `https://ticketnft.example.com/metadata/${eventId}`
    } = eventData;

    // Convert price from MATIC to Wei
    const priceInWei = ethers.parseEther(price.toString());

    // Call the mintTicket function
    const tx = await contract.mintTicket(
      to,
      eventId,
      eventName,
      eventDate,
      venue,
      priceInWei,
      tokenURI,
      { value: priceInWei }
    );

    console.log('Transaction submitted:', tx.hash);
    
    // Wait for confirmation
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt);

    // Extract tokenId from events
    const event = receipt.logs.find(log => {
      try {
        const parsed = contract.interface.parseLog(log);
        return parsed.name === 'TicketMinted';
      } catch {
        return false;
      }
    });

    let tokenId = null;
    if (event) {
      const parsed = contract.interface.parseLog(event);
      tokenId = Number(parsed.args.tokenId);
    }

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      tokenId,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error('Error minting ticket:', error);
    throw error;
  }
};

/**
 * Transfer ticket to another address
 */
export const transferTicket = async (signer, toAddress, tokenId) => {
  try {
    const contract = await getContract(signer);
    
    const tx = await contract.transferTicket(toAddress, tokenId);
    console.log('Transfer transaction submitted:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transfer confirmed:', receipt);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    console.error('Error transferring ticket:', error);
    throw error;
  }
};

/**
 * Get ticket details
 */
export const getTicketDetails = async (tokenId) => {
  try {
  const contract = await getContractReadOnly();
    
    const details = await contract.getTicketDetails(tokenId);
    
    return {
      eventId: Number(details[0]),
      eventName: details[1],
      eventDate: details[2],
      venue: details[3],
      price: ethers.formatEther(details[4]),
      currentOwner: details[5],
      originalOwner: details[6],
      mintedAt: Number(details[7]),
      isValid: details[8],
    };
  } catch (error) {
    console.error('Error getting ticket details:', error);
    throw error;
  }
};

/**
 * Get all tickets owned by an address
 */
export const getTicketsByOwner = async (ownerAddress) => {
  try {
  const contract = await getContractReadOnly();
    
    const tokenIds = await contract.getTicketsByOwner(ownerAddress);
    
    // Convert BigInt to Number
    return tokenIds.map(id => Number(id));
  } catch (error) {
    console.error('Error getting tickets by owner:', error);
    throw error;
  }
};

/**
 * Verify ticket ownership
 */
export const verifyTicket = async (tokenId, ownerAddress) => {
  try {
  const contract = await getContractReadOnly();
    
    const isValid = await contract.verifyTicket(tokenId, ownerAddress);
    
    return isValid;
  } catch (error) {
    console.error('Error verifying ticket:', error);
    throw error;
  }
};

/**
 * Get all tickets for an event
 */
export const getEventTickets = async (eventId) => {
  try {
  const contract = await getContractReadOnly();
    
    const tokenIds = await contract.getEventTickets(eventId);
    
    return tokenIds.map(id => Number(id));
  } catch (error) {
    console.error('Error getting event tickets:', error);
    throw error;
  }
};

/**
 * Get event ticket count
 */
export const getEventTicketCount = async (eventId) => {
  try {
    const contract = getContractReadOnly();
    
    const count = await contract.getEventTicketCount(eventId);
    
    return Number(count);
  } catch (error) {
    console.error('Error getting event ticket count:', error);
    throw error;
  }
};

/**
 * Get current token ID counter
 */
export const getCurrentTokenId = async () => {
  try {
    const contract = getContractReadOnly();
    
    const tokenId = await contract.getCurrentTokenId();
    
    return Number(tokenId);
  } catch (error) {
    console.error('Error getting current token ID:', error);
    throw error;
  }
};

export default {
  getContract,
  getContractReadOnly,
  mintTicket,
  transferTicket,
  getTicketDetails,
  getTicketsByOwner,
  verifyTicket,
  getEventTickets,
  getEventTicketCount,
  getCurrentTokenId,
};
