// what a call of the sdk fails with
export class BindistError extends Error {
    // the http status of the response, 0 when the failure isn't a response
    status;
    // the part of the upload it is about
    part;
    constructor(status, message, part) {
        super(message);
        this.name = "BindistError";
        this.status = status;
        if (part !== undefined)
            this.part = part;
    }
}
// resolves after that many milliseconds, rejects with the signal's reason when it aborts first
export function timeWait(milliseconds, signal) {
    return new Promise((resolve, reject) => {
        if (signal?.aborted)
            return reject(signal.reason);
        const abort = () => {
            clearTimeout(timer);
            reject(signal?.reason);
        };
        const timer = setTimeout(() => {
            signal?.removeEventListener("abort", abort);
            resolve();
        }, milliseconds);
        signal?.addEventListener("abort", abort, { once: true });
    });
}
// a name the api accepts for any file name: its plain character set, no leading punctuation, 200 characters
export function filenameClean(name) {
    const clean = name.replace(/[^A-Za-z0-9._+-]/g, "_").replace(/^[^A-Za-z0-9]/, "x$&");
    return (clean || "file").slice(0, 200);
}
