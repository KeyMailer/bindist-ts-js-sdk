import { BindistError } from "./util.js";
// POSTs a json body to the api, fails with the api's own message
export async function apiCall(config, path, body, signal) {
    const response = await (config.fetch ?? fetch)(`${config.url.replace(/\/+$/, "")}${path}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
        ...(signal ? { signal } : {}),
    });
    const text = await response.text();
    let data = null;
    try {
        data = JSON.parse(text);
    }
    catch {
        // not the api answering (a proxy, a wrong url), the text is all there is
    }
    if (!response.ok) {
        const error = typeof data === "object" && data !== null ? data.error : undefined;
        throw new BindistError(response.status, `${path}: ${typeof error === "string" ? error : text || response.statusText}`);
    }
    if (typeof data !== "object" || data === null)
        throw new BindistError(0, `${path}: the response isn't json, is the url the api's?`);
    return data;
}
