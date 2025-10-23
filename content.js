chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'run') {
        const query = request.query;
        const option = {
            startDate: request.start_date,
            endDate: request.end_date,
            publicationType: request.publication_type,
            language: request.language,
            page: 0
        };

        downloadPapers(query, option);
    }
});

const API_URL = 'https://www.academia.edu/v0';

const downloadPapers = async (query, option) => {
    try {
        const { total } = await search(query, option);
        const totalPage = Math.ceil(total / 10);

        if (total > 0) {
            for (let i = 0; i < totalPage; i++) {
                option.page = i;
                await bulkDownload(query, option);
                await timeout(5000);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

const bulkDownload = async (query, option) => {
    try {
        const { works } = await search(query, option);

        for (const work of works) {
            if (work.downloadableAttachments) {
                const attachment = work.downloadableAttachments[0];

                try {
                    await chrome.runtime.sendMessage({
                        action: 'download',
                        url: attachment.bulkDownloadUrl,
                        filename: attachment.bulkDownloadFileName
                    });
                } catch (err) {
                    console.error(err);
                }

                await timeout(5000);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

const search = async (query, option) => {
    const queryParams = new URLSearchParams({
        camelize_keys: true,
        canonical: true,
        fake_results: null,
        json: true,
        last_seen: null,
        offset: option.page * 10,
        query: query,
        search_mode: 'works',
        size: 10,
        sort: 'relevance',
        subdomain_param: 'api',
        user_language: 'en',
        publication_type: option.publicationType,
        language: option.language,
    }).toString();

    try {
        const response = await apiQuery(`${API_URL}/search/integrated_search?${queryParams}`);
        const { total, stats: { publicationTypeCounts } } = response;

        console.log(
            'Query:', query,
            'Total:', total,
            'Journal Article:', publicationTypeCounts[0][1],
            'Book:', publicationTypeCounts[1][1],
            'Conference Paper:', publicationTypeCounts[2][1],
            'Other:', publicationTypeCounts[3][1],
        );

        return response;
    } catch (err) {
        throw err;
    }
}

const apiQuery = (url, payload = null, method = 'GET') => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.withCredentials = true;
    xhr.responseType = 'json';

    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onload = () => {
        if (xhr.status === 200) {
            resolve(xhr.response);
        } else {
            reject(new Error(`API Query failed with status, ${xhr.status}`));
        }
    }

    xhr.onerror = () => {
        reject(new Error('API Query failed for some reasons, please try later...'));
    }

    if (method === 'GET') {
        xhr.send();
    } else {
        xhr.send(JSON.stringify(payload));
    }
});

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));