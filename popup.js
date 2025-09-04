document.getElementById("margin").addEventListener("change", function () {
  document.getElementById("customMargin").style.display = this.value === "custom" ? "block" : "none";
});

document.getElementById("exportBtn").addEventListener("click", () => {
  let marginValue = document.getElementById("margin").value;
  if (marginValue === "custom") {
    marginValue = parseInt(document.getElementById("customMargin").value) || 0;
    marginValue = marginValue / 25.4; // convert mm → inches
  } else {
    marginValue = parseFloat(marginValue); // already in inches
  }

  // Show loader
  document.getElementById("loader").style.display = "block";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["html2pdf.bundle.min.js"] // Inject html2pdf first
    }, () => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: autoScrollAndExport,
        args: [marginValue]
      });
    });
  });

  // Listen for "done" message
  chrome.runtime.onMessage.addListener((message) => {
    if (message.status === "done") {
      document.getElementById("loader").style.display = "none";
    }
  });
});

// This function runs in page context
function autoScrollAndExport(margin) {
  function scrollToBottom(callback) {
    let totalHeight = 0;
    const distance = 500;
    const timer = setInterval(() => {
      window.scrollBy(0, distance);
      let newHeight = document.body.scrollHeight;
      if (newHeight === totalHeight) {
        clearInterval(timer);
        callback();
      }
      totalHeight = newHeight;
    }, 500);
  }

  scrollToBottom(() => {
    const chatContentDiv = document.querySelector("#chat-area ol");
    console.log("chat",chatContentDiv);

    if (!chatContentDiv) {
      alert("Second child not found inside #chat-area!");
      return;
    }

    // Apply dark background
    const originalBg = chatContentDiv.style.backgroundColor;
    chatContentDiv.style.backgroundColor = "#1D1D20";

    const opt = {
      margin: [0,0,0,0],
      filename: 'chat.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(chatContentDiv)
      .save()
      .then(() => {
        chatContentDiv.style.backgroundColor = originalBg; // restore
        chrome.runtime.sendMessage({ status: "done" });
      });
  });
}
