import { api } from ".";
import { type User } from "../schemas/user";

const createUser = async (user: User) => {
const response = await api.post("/api/users", {
    id: user.id,
    username: user.username,
    email: user.email,
  });
  return response.data;
};

const getUser = async (user_id: string) => {
  const response = await api.get(`/api/users`, {
    params: {
      user_email: user_id
    }
  });
  return response;
};

export { createUser, getUser };