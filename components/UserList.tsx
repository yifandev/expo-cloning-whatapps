import users from "@/data/users";
import { User } from "@/types";
import React from "react";
import { FlatList } from "react-native";
import UserListItem from "./UserListItem";

type UserListProps = {
  onPress?: (user: User) => void;
};

export default function UserList({ onPress }: UserListProps) {
  return (
    <FlatList
      data={users}
      renderItem={({ item }) => <UserListItem onPress={onPress} user={item} />}
    />
  );
}
