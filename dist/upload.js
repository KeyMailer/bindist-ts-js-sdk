import { BindistError, timeWait } from "./util.js";
export { BindistError } from "./util.js";
// the first wait between two tries of a part, doubled every time
const RETRY_WAIT = 500;
async function partPut(part, file, attempts, signal, fetcher) {
    // the runtime works the length out from the body, and a browser refuses to have it set
    const headers = Object.fromEntries(Object.entries(part.headers).filter(([name]) => name.toLowerCase() !== "content-length"));
    // a slice has no type of its own, so nothing is sent that the url wasn't signed with
    const body = file.slice(part.offset, part.offset + part.size);
    for (let attempt = 1;; attempt++) {
        let failure;
        let response = null;
        try {
            response = await fetcher(part.url, { method: "PUT", headers, body, signal });
        }
        catch (error) {
            if (signal.aborted)
                throw error;
            failure = new BindistError(0, `part ${part.part} couldn't be sent: ${error instanceof Error ? error.message : error}`, part.part);
        }
        if (response) {
            const text = await response.text();
            if (response.ok)
                return { part: part.part, etag: response.headers.get("etag") ?? "" };
            // only a single part upload answers this (If-None-Match): the try that seemed to fail did arrive
            if (response.status === 412 && attempt > 1)
                return { part: part.part, etag: "" };
            failure = new BindistError(response.status, `part ${part.part} was refused: ${response.status} ${text}`, part.part);
            // a refusal is final, the same bytes get the same answer
            if (response.status < 500 && response.status !== 408 && response.status !== 429)
                throw failure;
        }
        if (attempt >= attempts)
            throw failure;
        await timeWait(RETRY_WAIT * 2 ** (attempt - 1), signal);
    }
}
// PUTs the file to the parts of an upload, the result is what /complete-upload takes as `parts`
export async function partsSend(parts, file, options = {}) {
    const total = parts.reduce((sum, part) => sum + part.size, 0);
    if (file.size !== total)
        throw new BindistError(0, `the file is ${file.size} bytes, the upload was requested for ${total}`);
    // the first part that fails stops the others
    const controller = new AbortController();
    const abort = () => controller.abort(options.signal?.reason);
    if (options.signal?.aborted)
        abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    const sent = [];
    let next = 0;
    let bytes = 0;
    const worker = async () => {
        while (next < parts.length) {
            const part = parts[next++];
            const result = await partPut(part, file, options.attempts ?? 3, controller.signal, options.fetch ?? fetch);
            // without the etags r2 can't assemble the parts
            if (!result.etag && parts.length > 1) {
                throw new BindistError(0, `the ETag of part ${part.part} can't be read, the cors policy of the bucket has to expose it`, part.part);
            }
            sent.push(result);
            bytes += part.size;
            options.on_progress?.(bytes, total);
        }
    };
    try {
        await Promise.all(Array.from({ length: Math.max(1, Math.min(options.parallel ?? 4, parts.length)) }, worker));
    }
    catch (error) {
        controller.abort(error);
        throw error;
    }
    finally {
        options.signal?.removeEventListener("abort", abort);
    }
    return sent.sort((a, b) => a.part - b.part);
}
