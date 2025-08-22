chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "download") {
        chrome.downloads.download({
            url: request.url,
            filename: request.filename
        }).then(downloadId => {
            console.log('Downloaded Successfully,', request.filename);
            sendResponse({ success: true, downloadId });
        }).catch(err => {
            console.error("Download Failed,", err);
            sendResponse({ success: false, error: err.message });
        });

        return true;
    }
});