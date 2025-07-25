import { User } from "@/api/typex2";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { Link, router } from "expo-router";
import { ArrowRightIcon } from "lucide-react-native";
import { Pressable } from "react-native";

export default function BagsListItemUser(props: {
  isPrivate: boolean;
  routeIndex?: number;
  user?: User;
}) {
  const render = () => (
    <HStack className="border-1 w-full flex-shrink rounded-b-md border-background-200 bg-background-0 px-2 py-3">
      {props.routeIndex != undefined && props.user ? (
        <>
          <Text>{"#" + (props.routeIndex + 1)}</Text>
          <Text numberOfLines={1} className="mx-1 flex-shrink flex-grow" bold>
            {props.user.name}
          </Text>
          {props.isPrivate ? null : (
            <Icon
              as={ArrowRightIcon}
              key="arrow"
              className="text-primary-500"
            />
          )}
        </>
      ) : (
        <Text className="text-typography-500" bold>
          Bag user not found
        </Text>
      )}
    </HStack>
  );

  if (props.isPrivate) return render();
  return (
    <Link
      href={
        props.user?.uid
          ? `/(auth)/(tabs)/route/${props.user.uid}`
          : "/(auth)/(tabs)/route/"
      }
    >
      {render()}
    </Link>
  );
}
