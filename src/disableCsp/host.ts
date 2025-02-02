import type { OnHeadersReceivedListenerDetails } from "electron";

moonlightHost.events.on("headers-received", (details: OnHeadersReceivedListenerDetails, isMainWindow: boolean) => {
  if (details.responseHeaders) {
    if (details.responseHeaders["X-Frame-Options"]) {
      delete details.responseHeaders["X-Frame-Options"];
    } else if (details.responseHeaders["x-frame-options"]) {
      delete details.responseHeaders["x-frame-options"];
    }

    if (details.responseHeaders["Content-Security-Policy"]) {
      delete details.responseHeaders["Content-Security-Policy"];
    } else if (details.responseHeaders["content-security-policy"]) {
      delete details.responseHeaders["content-security-policy"];
    }
  }
});
