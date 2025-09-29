import { api } from ".";
import { type Event } from "../schemas/event";

const updateEventDetails = async (event: Event) => {
    const response = await api.post("/api/event", {
    user_id: event.user_id,
    user_email: event.user_email,
    event_details: event.event_details,
    status: event.status,
    created_at: event.created_at,
  });
  return response;
};

export { updateEventDetails };