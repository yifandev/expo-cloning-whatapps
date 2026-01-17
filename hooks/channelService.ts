// channelService.ts
import { ChannelQueryResult, ChannelWithUsers } from "@/types";
import { SupabaseClient } from "@supabase/supabase-js";
import { useEffect } from "react";

/**
 * Fetches channels for a specific user
 */
export async function fetchUserChannels(
  supabase: SupabaseClient,
  userId?: string,
): Promise<ChannelWithUsers[]> {
  if (!userId) return [];

  try {
    // Step 1: Get user's channel subscriptions
    const { data: userChannels, error: userChannelsError } = await supabase
      .from("channel_users")
      .select("channel_id")
      .eq("user_id", userId);

    if (userChannelsError) throw userChannelsError;

    const channelIds = userChannels.map((uc) => uc.channel_id);
    if (channelIds.length === 0) return [];

    // Step 2: Get channel details with users
    const { data: channels, error: channelsError } = await supabase
      .from("channels")
      .select(
        `
        *,
        channel_users (
          user:users(*)
        )
      `,
      )
      .in("id", channelIds)
      .returns<ChannelQueryResult[]>();

    if (channelsError) throw channelsError;

    // Step 3: Get last message for each channel
    const channelsWithLastMessage = await Promise.all(
      channels.map(async (channel) => {
        const lastMessage = await fetchLastMessage(supabase, channel.id);
        const users = channel.channel_users.map((cu) => cu.user);

        return {
          ...channel,
          users,
          lastMessage: lastMessage || undefined,
        };
      }),
    );

    // Sort by most recent activity
    return sortChannelsByActivity(channelsWithLastMessage);
  } catch (error) {
    console.error("Error fetching channels:", error);
    throw error;
  }
}

/**
 * Fetches the last message for a channel
 */
export async function fetchLastMessage(
  supabase: SupabaseClient,
  channelId: string,
) {
  const { data } = await supabase
    .from("messages")
    .select("id, content, created_at, user_id, image")
    .eq("channel_id", channelId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

/**
 * Sorts channels by activity (last message time or creation time)
 */
export function sortChannelsByActivity(
  channels: ChannelWithUsers[],
): ChannelWithUsers[] {
  return channels.sort((a, b) => {
    const timeA = a.lastMessage?.created_at || a.created_at;
    const timeB = b.lastMessage?.created_at || b.created_at;
    return new Date(timeB).getTime() - new Date(timeA).getTime();
  });
}

interface UseChannelSubscriptionsProps {
  supabase: SupabaseClient;
  userId: string | undefined;
  onDataChange: () => Promise<void>;
}

/**
 * Custom hook for managing channel subscriptions
 */
export function useChannelSubscriptions({
  supabase,
  userId,
  onDataChange,
}: UseChannelSubscriptionsProps) {
  useEffect(() => {
    if (!userId) return;

    const handleMessagesChange = async () => {
      console.log("Messages change received");
      await onDataChange();
    };

    const handleChannelsChange = async () => {
      console.log("Channels change received");
      await onDataChange();
    };

    const handleChannelUsersChange = async () => {
      console.log("Channel users change received");
      await onDataChange();
    };

    // Setup subscriptions
    const setupSubscriptions = () => {
      // Messages subscription
      const messagesSubscription = supabase
        .channel("messages-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "messages",
          },
          handleMessagesChange,
        )
        .subscribe((status) => {
          console.log("Messages subscription status:", status);
        });

      // Channels subscription
      const channelsSubscription = supabase
        .channel("channels-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "channels",
          },
          handleChannelsChange,
        )
        .subscribe((status) => {
          console.log("Channels subscription status:", status);
        });

      // Channel users subscription (only for current user)
      const channelUsersSubscription = supabase
        .channel("channel-users-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "channel_users",
            filter: `user_id=eq.${userId}`,
          },
          handleChannelUsersChange,
        )
        .subscribe((status) => {
          console.log("Channel users subscription status:", status);
        });

      return {
        messagesSubscription,
        channelsSubscription,
        channelUsersSubscription,
      };
    };

    const subscriptions = setupSubscriptions();

    // Cleanup subscriptions
    return () => {
      const {
        messagesSubscription,
        channelsSubscription,
        channelUsersSubscription,
      } = subscriptions;
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(channelsSubscription);
      supabase.removeChannel(channelUsersSubscription);
    };
  }, [supabase, userId, onDataChange]);
}
