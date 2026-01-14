import { useChannel } from "@/providers/ChannelProvider";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, FlatList, ImageBackground } from "react-native";
import MessageListItem from "./MessageItemList";

export default function MessageList() {
  const { channel } = useChannel();
  const supabase = useSupabase();
  const { user } = useUser();

  // TODO: PAGINATION
  const {
    data: messages,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["messages", channel?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", channel!.id)
        .order("created_at", { ascending: false })
        .throwOnError();

      return data;
    },
    enabled: !!channel?.id,
  });

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <ImageBackground
      source={require("@/assets/images/bgwa.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      <FlatList
        data={messages}
        contentContainerClassName="p-4"
        className="flex-1"
        renderItem={({ item }) => (
          <MessageListItem
            message={item}
            isOwnMessage={item.user_id === user?.id}
          />
        )}
        inverted
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}
