// Keeps extension alive for messaging
chrome.runtime.onInstalled.addListener(() => {
  console.log("Chat Exporter installed.");
});
