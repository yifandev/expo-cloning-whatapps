import messages from "@/data/messages";
import React from "react";
import { FlatList, ImageBackground } from "react-native";
import MessageListItem from "./MessageItemList";

export default function MessageList() {
  const myId = "u-1";

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
            isOwnMessage={item.user.id === myId}
          />
        )}
        inverted
        showsVerticalScrollIndicator={false}
      />
    </ImageBackground>
  );
}
