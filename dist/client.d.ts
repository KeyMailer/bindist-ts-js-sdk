import { type BindistConfig } from "./http.ts";
import { type PartsSendOptions } from "./upload.ts";
import { type Download, type DownloadRequest, type Upload, type UploadCompleteRequest, type UploadCompleted, type UploadRequest } from "./wire.ts";
export type FileUploadOptions = PartsSendOptions & Omit<UploadRequest, "size">;
export type PublicUrlWaitOptions = {
    interval?: number;
    timeout?: number;
    signal?: AbortSignal;
};
export declare class Bindist {
    #private;
    constructor(config: BindistConfig);
    uploadRequest(request: UploadRequest, signal?: AbortSignal): Promise<Upload>;
    uploadComplete(request: UploadCompleteRequest, signal?: AbortSignal): Promise<UploadCompleted>;
    downloadRequest(request: DownloadRequest, signal?: AbortSignal): Promise<Download>;
    fileUpload(file: Blob, options: FileUploadOptions): Promise<UploadCompleted>;
    publicUrlWait(key: string, options?: PublicUrlWaitOptions): Promise<string>;
}
