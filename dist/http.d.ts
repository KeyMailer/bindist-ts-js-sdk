import { type Fetch } from "./util.ts";
export type BindistConfig = {
    url: string;
    key: string;
    fetch?: Fetch;
};
export declare function apiCall<T>(config: BindistConfig, path: string, body: unknown, signal?: AbortSignal): Promise<T>;
