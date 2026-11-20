export declare class BindistError extends Error {
    status: number;
    part?: number;
    constructor(status: number, message: string, part?: number);
}
export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
export declare function timeWait(milliseconds: number, signal?: AbortSignal): Promise<void>;
export declare function filenameClean(name: string): string;
