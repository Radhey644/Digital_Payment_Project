# Wallet Connection Troubleshooting Guide

## Problem: "Connect Wallet" button not working

### Fixes Applied:

1. **Fixed `getCurrentAccount()` function** in `connectWallet.js`
   - Now uses `eth_accounts` instead of `getSigner()` to avoid errors when not connected
   - Returns `null` gracefully if no accounts are connected

2. **Enhanced `WalletContext.tsx`**
   - Added detailed console logging for debugging
   - Better error handling with user-friendly messages
   - Shows connection rejection messages (code 4001)
   - Removed force page reload on network change

3. **Improved Header Component**
   - Added click handler with console log for debugging
   - Shows error messages below the button
   - Better visual feedback during connection

4. **Created MetaMaskPrompt Component**
   - Shows installation prompt if MetaMask not detected
   - Direct link to MetaMask download

## How to Test:

### 1. Check Browser Console
Open browser DevTools (F12) and look for these logs:
- "MetaMask detected" or "MetaMask not detected"
- "Connect button clicked in Header"
- "Requesting wallet connection..."
- "Wallet connected: 0x..."

### 2. Common Issues & Solutions:

#### Issue: Button clicks but nothing happens
**Check:**
- Open browser console (F12) - do you see "Connect button clicked"?
- Is MetaMask extension installed and enabled?
- Try refreshing the page (Ctrl+R)

#### Issue: "MetaMask is not installed" error
**Solution:**
- Install MetaMask: https://metamask.io/download/
- Refresh the page after installation

#### Issue: MetaMask popup doesn't appear
**Solution:**
- Click the MetaMask extension icon in browser
- Unlock MetaMask if locked
- Check if popup is blocked - allow popups for localhost
- Try clicking "Connect Wallet" again

#### Issue: "User rejected the request"
**Solution:**
- This means you clicked "Cancel" in MetaMask
- Click "Connect Wallet" again
- Click "Next" then "Connect" in MetaMask popup

#### Issue: "Wrong network" warning
**Solution:**
- The app will auto-prompt to switch to Mumbai
- Or manually switch in MetaMask:
  - Click network dropdown (top of MetaMask)
  - Select "Polygon Mumbai Testnet"
  - If not listed, add it manually (see DEPLOYMENT_GUIDE.md)

### 3. Test the Full Flow:

1. **Open the app**: http://localhost:5173
2. **Open DevTools**: Press F12
3. **Click "Connect Wallet"** in the header
4. **Check console** for logs
5. **MetaMask popup should appear**
6. **Click "Next" then "Connect"**
7. **Button should turn green** and show your address
8. **Try buying a ticket** - should now work!

### 4. Debug Steps:

If still not working, check each step:

```javascript
// 1. Check if MetaMask is installed
console.log('MetaMask:', typeof window.ethereum !== 'undefined' ? 'Found' : 'Not Found');

// 2. Check if already connected
window.ethereum.request({ method: 'eth_accounts' })
  .then(accounts => console.log('Connected accounts:', accounts));

// 3. Try manual connection
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => console.log('Connected:', accounts[0]))
  .catch(error => console.error('Error:', error));
```

Paste these commands in the browser console to test.

### 5. Clear Cache and Reset:

If all else fails:
1. Disconnect from the app (if partially connected)
2. Go to MetaMask → Settings → Advanced → Clear activity tab data
3. Refresh the page (Ctrl+Shift+R for hard refresh)
4. Try connecting again

### 6. Expected Behavior:

✅ **Before Connection:**
- Header shows "Connect Wallet" button (blue/indigo)
- Clicking events shows "Please connect your wallet first"

✅ **During Connection:**
- Button shows "Connecting..."
- MetaMask popup appears
- Console shows connection logs

✅ **After Connection:**
- Button turns green
- Shows shortened address (0x1234...5678)
- Shows MATIC balance on hover
- Can buy tickets
- Can view/transfer tickets

### 7. Network Configuration:

Make sure Mumbai testnet is configured in MetaMask:
- **Network Name:** Polygon Mumbai Testnet
- **RPC URL:** https://rpc-mumbai.maticvigil.com
- **Chain ID:** 80001
- **Currency:** MATIC
- **Explorer:** https://mumbai.polygonscan.com

---

## Still Having Issues?

**Check these files for any syntax errors:**
- `src/context/WalletContext.tsx`
- `src/web3/connectWallet.js`
- `src/components/Header.tsx`

**Make sure you have:**
- Latest Chrome/Firefox/Brave browser
- MetaMask extension v10.0+
- React app running on http://localhost:5173

**Try:**
1. Restart the dev server: `npm run dev`
2. Clear browser cache
3. Try in incognito/private mode
4. Try a different browser

---

## Quick Test Command:

Open browser console and run:
```javascript
window.ethereum.request({ method: 'eth_requestAccounts' })
```

If this works, MetaMask is properly installed and the issue is in the React code.
If this fails, MetaMask is not properly installed or enabled.
