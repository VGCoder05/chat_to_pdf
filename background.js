chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "download-html") {
    const html = message.htmlString || "";
    const filename = message.filename || "chat.html";

    try {
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);

      chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        if (chrome.runtime.lastError) {
          // fallback: use data URL
          const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
          chrome.downloads.download({ url: dataUrl, filename: filename, saveAs: true });
        }
        // revoke object URL after a bit
        setTimeout(() => URL.revokeObjectURL(url), 15000);
      });

    } catch (err) {
      // fallback to data URL if Blob/URL.createObjectURL fails
      const dataUrl = "data:text/html;charset=utf-8," + encodeURIComponent(html);
      chrome.downloads.download({ url: dataUrl, filename: filename, saveAs: true });
    }

    sendResponse({ status: "started" });
    return true; // keep channel open for async response
  }
});
