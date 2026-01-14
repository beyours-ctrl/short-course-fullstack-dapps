const connectBtn = document.getElementById("connectBtn");
const statusEl = document.getElementById("status");
const addressEl = document.getElementById("address");
const networkEl = document.getElementById("network");
const balanceEl = document.getElementById("balance");

// Avalanche Fuji Testnet chainId (hex)
const AVALANCHE_FUJI_CHAIN_ID = "0xa869";

function formatAvaxBalance(balanceWei) {
  const balance = parseInt(balanceWei, 16);
  return (balance / 1e18).toFixed(4);
}

// Shorten address (0x1234...abcd)
function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    statusEl.textContent = "Wallet Not Found ❌";
    alert("Core Wallet tidak terdeteksi. Silakan install Core Wallet.");
    return;
  }

  try {
    statusEl.textContent = "Connecting...";

    // Request wallet accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];
    addressEl.textContent = shortenAddress(address);

    // Disable button after connect
    connectBtn.disabled = true;
    connectBtn.textContent = "Wallet Connected";

    // Get chainId
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (chainId === AVALANCHE_FUJI_CHAIN_ID) {
      networkEl.textContent = "Avalanche Fuji Testnet";
      statusEl.textContent = "Connected ✅";
      statusEl.style.color = "#4cd137";

      // Get AVAX balance
      const balanceWei = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      balanceEl.textContent = formatAvaxBalance(balanceWei);
    } else {
      networkEl.textContent = "Wrong Network ❌";
      statusEl.textContent = "Please switch to Avalanche Fuji";
      statusEl.style.color = "#fbc531";
      balanceEl.textContent = "-";
    }
  } catch (error) {
    console.error(error);
    statusEl.textContent = "Connection Failed ❌";
    statusEl.style.color = "red";
  }
}

// Listen accountsChanged
if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      statusEl.textContent = "Not Connected";
      addressEl.textContent = "-";
      balanceEl.textContent = "-";
      networkEl.textContent = "-";
      connectBtn.disabled = false;
      connectBtn.textContent = "Connect Wallet";
    } else {
      addressEl.textContent = shortenAddress(accounts[0]);
    }
  });

  // Listen chainChanged
  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}

connectBtn.addEventListener("click", connectWallet);