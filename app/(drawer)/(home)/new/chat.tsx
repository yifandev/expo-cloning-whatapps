import UserList from "@/components/UserList";
import { User } from "@/types";
import React from "react";
import { View } from "react-native";

export default function LayoutNew() {
  const handleUserPress = (user: User) => {
    console.log("Clicked", user.first_name);
  };
  return (
    <View className="">
      <UserList onPress={handleUserPress} />
    </View>
  );
}
