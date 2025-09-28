// Simple loader helpers
const loader = document.getElementById("loader");
function showLoader() { if (loader) loader.style.display = "block"; }
function hideLoader() { if (loader) loader.style.display = "none"; }

// === Margin dropdown (unchanged) ===
const marginEl = document.getElementById("margin");
if (marginEl) {
  marginEl.addEventListener("change", function () {
    const cm = document.getElementById("customMargin");
    if (cm) cm.style.display = this.value === "custom" ? "block" : "none";
  });
}

// Helper: execute a small function in the active tab to return the chat HTML
function getChatHtmlFromPage(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) {
      callback({ error: "no_active_tab" });
      return;
    }

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        // runs inside the page (content scope)
        const chatEl = document.querySelector("#chat-area ol");
        if (!chatEl) return { error: "not_found" };
        const clone = chatEl.cloneNode(true);
        return clone.outerHTML; // returned value goes back to popup
      }
    }, (injectionResults) => {
      if (!injectionResults || !injectionResults[0]) {
        callback({ error: "no_result" });
        return;
      }
      callback({ result: injectionResults[0].result });
    });
  });
}

// Build the final HTML in popup (has access to chrome.runtime.getURL)
function html_template(innerContent = "") {
  return `
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <title>Chat</title>
    <link rel="stylesheet" href="${chrome.runtime.getURL( "/style/style01.css")}">
    <link rel="stylesheet" href="${chrome.runtime.getURL( "/style/style02.css")}">
    <link rel="stylesheet" href="${chrome.runtime.getURL( "/style/style03.css")}">
    <style>
        body {
            background: #1d1d20;
            padding: 1rem;
        }

        div[data-sentry-element="CodeBlockCode"] pre {
            padding: 0.5rem;
        }

        ol>div:nth-of-type(even) {
            flex: 1;
            padding: 0.5rem 0.75rem;
            border-radius: 1.5rem;
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
                display: block !important;
                /* flex/grid can cause shrinkage */
            }

            /* Prevent page breaks inside important blocks */
            blockquote,
            img {
                page-break-inside: avoid;
                /* old */
                break-inside: avoid;
                /* modern */
            }

            pre {
                height: auto !important;
                max-height: none !important;
                white-space: pre-wrap !important;
                /* allow wrapping */
                word-break: break-word !important;
                /* break long words */
                page-break-inside: auto !important;
                /* allow splitting across pages */
                break-inside: auto !important;
            }

            /* Only prevent full tables from splitting mid-row */
            table,
            tr {
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

<body data-attribute="dark">${innerContent}</body>

</html>
  `;
}

// === Open styled tab ===
const openBtn = document.getElementById("openTabBtn");
if (openBtn) {
  openBtn.addEventListener("click", () => {
    showLoader();
    getChatHtmlFromPage((res) => {
      if (res.error) {
        hideLoader();
        alert("Chat content not found on the page.");
        return;
      }
      const fullHtml = html_template(res.result);
      const newTab = window.open();
      newTab.document.write(fullHtml);
      newTab.document.close();
      hideLoader();
    });
  });
}

// === Download as HTML ===
const downloadBtn = document.getElementById("downloadHtmlBtn");
if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    showLoader();
    getChatHtmlFromPage((res) => {
      if (res.error) {
        hideLoader();
        alert("Chat content not found on the page.");
        return;
      }
      const fullHtml = html_template(res.result);

      // Send to background for downloading (background handles chrome.downloads)
      chrome.runtime.sendMessage({
        type: "download-html",
        htmlString: fullHtml,
        filename: "chat.html"
      }, () => {
        // optional: callback after message delivered
        hideLoader();
      });
    });
  });
}
