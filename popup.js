document.getElementById("margin").addEventListener("change", function () {
  document.getElementById("customMargin").style.display =
    this.value === "custom" ? "block" : "none";
});

// === New feature: Open in Styled Tab ===
document.getElementById("openTabBtn").addEventListener("click", () => {
  document.getElementById("loader").style.display = "block";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: open_chat,
    });
    chrome.runtime.onMessage.addListener((message) => {
      if (message.status === "done") {
        document.getElementById("loader").style.display = "none";
      }
    });
  });
});

function open_chat() {
  const chatContentDiv = document.querySelector("#chat-area ol");
  if (!chatContentDiv) {
    alert("Chat content not found!");
    return;
  }

  const newTab = window.open();
  newTab.document.write(html_template());
  newTab.document.close();

  // (no serialization)
  const clone = chatContentDiv.cloneNode(true);
  newTab.document.body.appendChild(clone);
  chrome.runtime.sendMessage({ status: "done" });

  function html_template() {
    return `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Chat</title>
            <link rel="stylesheet" href="${chrome.runtime.getURL(
              "/style/style01.css"
            )}">
            <link rel="stylesheet" href="${chrome.runtime.getURL(
              "/style/style02.css"
            )}">
            <link rel="stylesheet" href="${chrome.runtime.getURL(
              "/style/style03.css"
            )}">
             <style>
      body {
        background: #1d1d20;
        padding: 1rem;
      }

      div[data-sentry-element="CodeBlockCode"] pre {
        padding: 0.5rem;
      }
      
ol > div:nth-child(even) {
  flex: 1;              
  border-radius: 1.5rem; 
  padding: 0.5rem 0.75rem;
}


      body[data-attribute="dark"] {
        --header-primary: 0 0% 100%;
        --header-secondary: 0 0% 100%;
        --text-primary: 0 0% 100%;
        --text-secondary: 0 0% 100%;

        --surface-primary: 213, 27%, 17%;
        --surface-secondary: 213, 27%, 17%;

        --surface-tertiary: 208 27.9% 12%;

        & .truncate {
          color: white;
        }
        & code {
          --text-primary: 28 100% 76.1%;
        }
      }

      @media print {
        /* Reset containers so they grow with content */
        div,
        section,
        article,
        main,
        body {
          height: auto !important;
          max-height: none !important;
          width: auto !important;
          max-width: 100% !important;
        }
        div[data-sentry-component="SideBySideOrStackedMessageGroup"] {
          display: block !important; /* flex/grid can cause shrinkage */
        }

        /* Prevent page breaks inside important blocks */
        blockquote,
        img {
          page-break-inside: avoid; /* old */
          break-inside: avoid; /* modern */
        }

        pre{
          height: auto !important;
          max-height: none !important;

          white-space: pre-wrap !important; /* allow wrapping */
          word-break: break-word !important; /* break long words */
          page-break-inside: auto !important; /* allow splitting across pages */
          break-inside: auto !important;
        }

        /* Only prevent full tables from splitting mid-row */
        table,
        tr{
          page-break-inside: auto;
          break-inside: auto;
        }

        /* Optional: ensure headers stay with next content */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          page-break-after: avoid;
          break-after: avoid;
        }
      }

    </style>
          </head>
          <body data-attribute="dark"></body>
          </html>
        `;
  }
}
