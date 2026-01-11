import ChannelList from "@/components/ChannelList";
import channels from "@/data/channels";
import React from "react";
import { FlatList } from "react-native";

export default function ChannelListScreen() {
  return (
    <FlatList
      data={channels}
      renderItem={({ item }) => <ChannelList channel={item} />}
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
    />
  );
}
