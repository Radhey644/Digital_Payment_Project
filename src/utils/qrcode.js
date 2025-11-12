import QRCode from 'qrcode';

/**
 * Generate QR code for a ticket
 * @param {Object} ticketData - Ticket information
 * @returns {Promise<string>} QR code data URL
 */
export const generateTicketQR = async (ticketData) => {
  try {
    const { tokenId, ownerAddress, eventId, eventName } = ticketData;
    
    // Create QR data payload
    const qrData = JSON.stringify({
      tokenId,
      owner: ownerAddress,
      eventId,
      eventName,
      timestamp: Date.now(),
      type: 'TICKET_NFT'
    });
    
    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Generate QR code as SVG string
 * @param {Object} ticketData - Ticket information
 * @returns {Promise<string>} QR code SVG string
 */
export const generateTicketQRSVG = async (ticketData) => {
  try {
    const { tokenId, ownerAddress, eventId, eventName } = ticketData;
    
    const qrData = JSON.stringify({
      tokenId,
      owner: ownerAddress,
      eventId,
      eventName,
      timestamp: Date.now(),
      type: 'TICKET_NFT'
    });
    
    const qrCodeSVG = await QRCode.toString(qrData, {
      type: 'svg',
      width: 300,
      margin: 2
    });
    
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating QR SVG:', error);
    throw error;
  }
};

/**
 * Parse QR code data
 * @param {string} qrData - QR code data string
 * @returns {Object} Parsed ticket data
 */
export const parseTicketQR = (qrData) => {
  try {
    const data = JSON.parse(qrData);
    
    if (data.type !== 'TICKET_NFT') {
      throw new Error('Invalid QR code type');
    }
    
    return {
      tokenId: data.tokenId,
      ownerAddress: data.owner,
      eventId: data.eventId,
      eventName: data.eventName,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.error('Error parsing QR data:', error);
    throw error;
  }
};

/**
 * Download QR code as image
 * @param {string} qrDataURL - QR code data URL
 * @param {string} filename - Download filename
 */
export const downloadQRCode = (qrDataURL, filename = 'ticket-qr.png') => {
  const link = document.createElement('a');
  link.href = qrDataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default {
  generateTicketQR,
  generateTicketQRSVG,
  parseTicketQR,
  downloadQRCode
};
