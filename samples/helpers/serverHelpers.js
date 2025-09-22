/**
 * Fetches the server version from the specified URL.
 * @param {string} url - The server URL to fetch the status from.
 * @returns {Promise<string>} - The server version or an error message if fetching fails.
 */
export async function getServerVersion(url) {
    let serverResponse = await fetch(url + '/status.json');
    if (!serverResponse.ok) {
        return `Error fetching version, HTTP status: ${serverResponse.status}`;
    }
    let responseData = await serverResponse.json();

    return responseData.server_version;
}
