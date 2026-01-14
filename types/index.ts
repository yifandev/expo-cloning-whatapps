import { Tables } from "./database.types";

export type Channel = Tables<"channels">;
export type User = Tables<"users">;
export type Message = Tables<"messages">;

// Channel dengan relasi users dan lastMessage
export type ChannelWithUsers = Channel & {
  users: User[];
  lastMessage?: Pick<
    Message,
    "id" | "content" | "created_at" | "user_id" | "image"
  > | null;
};

// Untuk query result dari Supabase
export type ChannelQueryResult = Channel & {
  channel_users: Array<{
    user: User;
  }>;
};
