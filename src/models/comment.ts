export interface Comment {
    id: number;
    level: number;
    user: string | null;
    time: number;
    time_ago: string;
    content: string;
    deleted?: boolean;
    dead?: boolean;
    comments: Comment[];
}
