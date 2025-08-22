document.querySelector('#download').onclick = () => {
    const query = document.querySelector('#query').value;
    const startDate = document.querySelector('#start_date').value;
    const endDate = document.querySelector('#end_date').value;
    const publicationType = document.querySelector('#publication_type').value;
    const language = document.querySelector('#language').value;

    if (query) {
        if (startDate && endDate && startDate <= endDate) {
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'run',
                    query: query,
                    start_date: startDate,
                    end_date: endDate,
                    publication_type: publicationType,
                    language: language,
                });
            });

            window.close();
        } else {
            alert("Please enter start date and end date.");
        }
    } else {
        alert("Please enter a valid query.");
    }
}