// Keeps extension alive for messaging
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chat Exporter installed.");
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "open_display" && msg.key) {
    const url =
      chrome.runtime.getURL("display.html") + "#" + encodeURIComponent(msg.key);
    chrome.tabs.create({ url });
  }
});
