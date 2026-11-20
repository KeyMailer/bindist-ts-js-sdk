import { apiCall } from "./http.js";
import { partsSend } from "./upload.js";
import { BindistError, timeWait } from "./util.js";
import { NEVER } from "./wire.js";
// the api as a consumer sees it. It holds the api key: for a server, a build script, never a front end
export class Bindist {
    #config;
    constructor(config) {
        this.#config = config;
    }
    // the urls a file of that size is PUT to, by this process (partsSend) or by whoever they are handed to
    uploadRequest(request, signal) {
        return apiCall(this.#config, "/request-upload", request, signal);
    }
    // has the api verify what arrived, the build can't be downloaded before this
    uploadComplete(request, signal) {
        return apiCall(this.#config, "/complete-upload", request, signal);
    }
    // a url that works now. Only store one whose expires_at is "never"
    downloadRequest(request, signal) {
        return apiCall(this.#config, "/request-download", request, signal);
    }
    // the whole upload of a file this process holds
    async fileUpload(file, options) {
        const content_type = options.content_type ?? file.type;
        const upload = await this.uploadRequest({ intent: options.intent, filename: options.filename, size: file.size, ...(content_type ? { content_type } : {}) }, options.signal);
        const parts = await partsSend(upload.parts, file, options);
        return this.uploadComplete({ key: upload.key, parts }, options.signal);
    }
    // makes a build public and resolves with its permanent url once it is
    async publicUrlWait(key, options = {}) {
        const deadline = Date.now() + (options.timeout ?? 900_000);
        for (;;) {
            const download = await this.downloadRequest({ key, as: "public" }, options.signal);
            if (download.expires_at === NEVER)
                return download.url;
            if (Date.now() >= deadline)
                throw new BindistError(0, `${key} is still being made public, ask again later`);
            await timeWait(options.interval ?? 2000, options.signal);
        }
    }
}
