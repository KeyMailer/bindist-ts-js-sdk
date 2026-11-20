import type { Bindist, FileUploadOptions } from "./client.ts";
import type { UploadCompleted } from "./wire.ts";
export type PathUploadOptions = Omit<FileUploadOptions, "filename"> & {
    filename?: string;
};
export declare function pathUpload(bindist: Bindist, path: string, options: PathUploadOptions): Promise<UploadCompleted>;
