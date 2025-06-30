import { BulkyItem } from "@/api/typex2";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import dayjs from "dayjs";
import { EllipsisIcon } from "lucide-react-native";
import { useContext, useMemo } from "react";
import { Image, Pressable } from "react-native";
import BagsListItemUser from "../bags/BagListItemUser";
import { AuthStoreContext } from "@/store/auth";
import { Icon } from "@/components/ui/icon";

export default function BulkyListItem(props: {
  bulky: BulkyItem;
  setSelected: () => void;
  isEditable: boolean;
  onOpenOptions: () => void;
}) {
  const { authStoreListRouteUsers: routeUsers } = useContext(AuthStoreContext);
  const routeUser = useMemo(() => {
    return routeUsers.find((u) => u.user.uid == props.bulky.user_uid);
  }, [props.bulky.user_uid, routeUsers]);
  const date = useMemo(() => {
    return dayjs(props.bulky.created_at).toDate();
  }, [props.bulky.created_at]);
  const message = useMemo(() => {
    return props.bulky.message.length > 100
      ? props.bulky.message.slice(0, 100) + "..."
      : props.bulky.message;
  }, [props.bulky.message]);

  return (
    <Card
      className="relative bg-transparent p-1"
      id={"bulky-" + props.bulky.id}
    >
      <Pressable
        onPress={() => props.setSelected()}
        onLongPress={props.isEditable ? () => props.onOpenOptions() : undefined}
      >
        {props.isEditable ? (
          <Pressable
            className="absolute right-2 top-2 z-10 flex rounded-full bg-black/30 p-1"
            onPress={props.onOpenOptions}
          >
            <Icon as={EllipsisIcon} color="#fff" size="xl" />
          </Pressable>
        ) : null}
        {props.bulky.image_url ? (
          <Box className="aspect-square">
            <Image
              className="h-full w-full rounded-t-md"
              alt=""
              source={{
                uri: props.bulky.image_url,
              }}
            />
          </Box>
        ) : null}
        <VStack
          className={`border-b border-b-typography-100 bg-background-0 p-3 ${props.bulky.image_url ? "" : "rounded-t-md"}`}
        >
          <Text className="text-typography-500" size="sm" bold>
            {date.toLocaleDateString()}
          </Text>
          <Text className="text-3xl">{props.bulky.title}</Text>
          <Text>{message}</Text>
        </VStack>
      </Pressable>
      <BagsListItemUser
        isPrivate={routeUser?.isPrivate || false}
        routeIndex={routeUser?.routeIndex}
        user={routeUser?.user}
      />
    </Card>
  );
}
