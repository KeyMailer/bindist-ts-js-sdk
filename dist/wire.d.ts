export declare const NEVER = "never";
export type Visibility = "private" | "public";
export type Expiry = string;
export type UploadRequest = {
    intent: Visibility;
    filename: string;
    size: number;
    content_type?: string;
};
export type UploadPart = {
    part: number;
    url: string;
    offset: number;
    size: number;
    headers: Record<string, string>;
};
export type Upload = {
    key: string;
    method: "PUT";
    parts: UploadPart[];
    expires_at: Expiry;
};
export type PartSent = {
    part: number;
    etag: string;
};
export type UploadCompleteRequest = {
    key: string;
    parts: PartSent[];
};
export type UploadCompleted = {
    key: string;
    size: number;
    state: "ready";
};
export type DownloadRequest = {
    key: string;
    as: Visibility;
};
export type Download = {
    url: string;
    expires_at: Expiry;
    state: "ready" | "promoting";
};
