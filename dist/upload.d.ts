import type { PartSent, UploadPart } from "./wire.ts";
import { type Fetch } from "./util.ts";
export { BindistError } from "./util.ts";
export type { PartSent, UploadPart } from "./wire.ts";
export type PartsSendOptions = {
    parallel?: number;
    attempts?: number;
    signal?: AbortSignal;
    on_progress?: (sent: number, total: number) => void;
    fetch?: Fetch;
};
export declare function partsSend(parts: UploadPart[], file: Blob, options?: PartsSendOptions): Promise<PartSent[]>;
