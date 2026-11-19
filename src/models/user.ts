/** Shape returned by https://api.hnpwa.com/v0/user/{id}.json */
export interface User {
    id: string;
    created_time: number;
    /** Relative creation time, e.g. "18 years ago". */
    created: string;
    karma: number;
    avg?: number;
    /** HTML. */
    about?: string;
}
