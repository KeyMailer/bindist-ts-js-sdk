// for the runtimes with a filesystem (node 20+, bun, deno)
import { openAsBlob } from "node:fs";
import { basename } from "node:path";
import { filenameClean } from "./util.js";
// the whole upload of a file on disk, read part by part and never held in memory as a whole
export async function pathUpload(bindist, path, options) {
    const file = await openAsBlob(path);
    return bindist.fileUpload(file, { ...options, filename: options.filename ?? filenameClean(basename(path)) });
}
