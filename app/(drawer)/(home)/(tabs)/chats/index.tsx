import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

import ChannelList from "@/components/ChannelList";
import { useSupabase } from "@/providers/SupabaseProvider";
import { ChannelQueryResult, ChannelWithUsers } from "@/types";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";

export default function ChannelListScreen() {
  const supabase = useSupabase();
  const { user } = useUser();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);

  const {
    data: channels,
    error,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<ChannelWithUsers[]>({
    queryKey: ["channels", user?.id],
    queryFn: fetchUserChannels,
    enabled: !!user?.id,
  });

  async function fetchUserChannels(): Promise<ChannelWithUsers[]> {
    if (!user?.id) return [];

    try {
      // Step 1: Get user's channel subscriptions
      const { data: userChannels, error: userChannelsError } = await supabase
        .from("channel_users")
        .select("channel_id")
        .eq("user_id", user.id);

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
        `
        )
        .in("id", channelIds)
        .returns<ChannelQueryResult[]>();

      if (channelsError) throw channelsError;

      // Step 3: Get last message for each channel
      const channelsWithLastMessage = await Promise.all(
        channels.map(async (channel) => {
          const lastMessage = await fetchLastMessage(channel.id);
          const users = channel.channel_users.map((cu) => cu.user);

          return {
            ...channel,
            users,
            lastMessage: lastMessage || undefined,
          };
        })
      );

      // Sort by most recent activity
      return sortChannelsByActivity(channelsWithLastMessage);
    } catch (error) {
      console.error("Error fetching channels:", error);
      throw error;
    }
  }

  async function fetchLastMessage(channelId: string) {
    const { data } = await supabase
      .from("messages")
      .select("id, content, created_at, user_id, image")
      .eq("channel_id", channelId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    return data;
  }

  function sortChannelsByActivity(
    channels: ChannelWithUsers[]
  ): ChannelWithUsers[] {
    return channels.sort((a, b) => {
      const timeA = a.lastMessage?.created_at || a.created_at;
      const timeB = b.lastMessage?.created_at || b.created_at;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }

  // Realtime subscriptions setup
  useEffect(() => {
    if (!user?.id) return;

    const setupRealtimeSubscriptions = () => {
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
          handleMessagesChange
        )
        .subscribe((status) => {
          console.log("Messages subscription status:", status);
          setIsRealtimeConnected(status === "SUBSCRIBED");
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
          handleChannelsChange
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
            filter: `user_id=eq.${user.id}`,
          },
          handleChannelUsersChange
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

    const handleMessagesChange = async () => {
      console.log("Messages change received");
      await refetch();
    };

    const handleChannelsChange = async () => {
      console.log("Channels change received");
      await refetch();
    };

    const handleChannelUsersChange = async () => {
      console.log("Channel users change received");
      await refetch();
    };

    const subscriptions = setupRealtimeSubscriptions();

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
  }, [supabase, user?.id, refetch]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    console.error("Channels error:", error);
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-red-500 text-center mb-2">
          Error loading channels
        </Text>
        <Text className="text-gray-500 text-sm text-center">
          Please pull down to refresh
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Realtime connection indicator */}
      {isRealtimeConnected && (
        <View className="bg-green-500 py-1 px-3 absolute top-2 right-2 z-10 rounded-full">
          <Text className="text-white text-xs">Live</Text>
        </View>
      )}

      <FlatList
        data={channels}
        className="bg-white"
        renderItem={({ item }) => <ChannelList channel={item} />}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8">
            <Text className="text-gray-500">No conversations yet</Text>
            <Text className="text-gray-400 text-sm mt-2">
              Start a new conversation to see it here
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor="#000000"
            colors={["#000000"]}
          />
        }
      />
    </>
  );
}
