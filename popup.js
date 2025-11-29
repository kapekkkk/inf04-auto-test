// Wczytanie zapisanych ustawień
chrome.storage.local.get(['targetScore', 'delay', 'enabled'], (data) => {
  document.getElementById('targetScore').value = data.targetScore || 75;
  document.getElementById('delay').value = data.delay || 500;
  updateStatus(data.enabled);
});

// Zapisanie ustawień i start
document.getElementById('startBtn').addEventListener('click', async () => {
  const targetScore = parseInt(document.getElementById('targetScore').value);
  const delay = parseInt(document.getElementById('delay').value);
  
  if (targetScore < 0 || targetScore > 100) {
    showStatus('❌ Wynik musi być między 0 a 100%', 'error');
    return;
  }
  
  await chrome.storage.local.set({
    targetScore,
    delay,
    enabled: true
  });
  
  updateStatus(true);
  showStatus('✅ Włączono! Odśwież stronę z testem', 'success');
  
  // Wyślij wiadomość do content script na aktywnej karcie
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url && tab.url.includes('egzamin-programista.pl')) {
    chrome.tabs.sendMessage(tab.id, { action: 'start', targetScore, delay });
  }
});

// Stop
document.getElementById('stopBtn').addEventListener('click', async () => {
  await chrome.storage.local.set({ enabled: false });
  updateStatus(false);
  showStatus('⏹️ Zatrzymano', 'stopped');
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url && tab.url.includes('egzamin-programista.pl')) {
    chrome.tabs.sendMessage(tab.id, { action: 'stop' });
  }
});

function updateStatus(enabled) {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (enabled) {
    startBtn.style.opacity = '0.6';
    stopBtn.style.opacity = '1';
  } else {
    startBtn.style.opacity = '1';
    stopBtn.style.opacity = '0.6';
  }
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  
  // Różne kolory w zależności od typu
  if (type === 'success') {
    statusDiv.style.background = 'rgba(76, 175, 80, 0.3)';
  } else if (type === 'error') {
    statusDiv.style.background = 'rgba(244, 67, 54, 0.3)';
  } else if (type === 'stopped') {
    statusDiv.style.background = 'rgba(255, 193, 7, 0.3)';
  } else {
    statusDiv.style.background = 'rgba(255, 255, 255, 0.15)';
  }
}

