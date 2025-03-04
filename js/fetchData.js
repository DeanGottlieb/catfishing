export async function fetchVersionInfo(versionNumberElement, lastUpdatedElement) {
    try {
        const response = await fetch('version.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (versionNumberElement && lastUpdatedElement) {
            versionNumberElement.textContent = data.version;
            lastUpdatedElement.textContent = data.lastUpdated;
        }
    } catch (error) {
        console.error('Error fetching version info:', error);
    }
}

export async function fetchUnwantedKeywords() {
    try {
        const response = await fetch('unwanted_keywords.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.unwanted_keywords;
    } catch (error) {
        console.error('Error fetching unwanted keywords:', error);
        return [];
    }
}

export async function fetchArticles() {
    try {
        const response = await fetch('articles.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.articleGroups;
    } catch (error) {
        console.error('Error fetching articles:', error);
        return {};
    }
}