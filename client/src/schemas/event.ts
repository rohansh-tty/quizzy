interface Event {
    user_id: string;
    user_email: string;
    event_details: "user-signup" | "user-signin" | "user-signout" | "create-quiz" ;
    status: "success" | "error";
    created_at: string;
}

export type { Event };