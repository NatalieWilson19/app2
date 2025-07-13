import { Bag, User } from "@/api/typex2";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Link } from "expo-router";
import {
  ArrowBigUpIcon,
  ChevronLeft,
  ChevronRight,
  Flag,
  Pause,
  Shield,
  ShoppingBagIcon,
} from "lucide-react-native";
import { I18nManager } from "react-native";

interface Props {
  user: User;
  index: number;
  isWarden: boolean;
  isHost: boolean;
  isAuthHost: boolean;
  isMe: boolean;
  isPaused: boolean;
  isPrivate: boolean;
  bags: Bag[];
}

export default function RouteItem(props: Props) {
  const hideLink =
    (props.isPaused || props.isPrivate) && !props.isAuthHost && !props.isMe;

    const Chevron = I18nManager.isRTL ? ChevronLeft : ChevronRight
  return (
    <Link
      key={props.user.uid}
      href={{
        pathname: "/(auth)/(tabs)/route/[user]",
        params: {
          user: props.user.uid,
        },
      }}
      disabled={hideLink}
    >
      <HStack className="items-center gap-3 border-b border-b-outline-200 bg-background-0 p-2">
        <Box className="relative h-10 w-12 items-end justify-center">
          {props.isPaused ? (
            <Icon
              as={Pause}
              className="fill-typography-700 text-transparent"
              size="lg"
            />
          ) : (
            <Text className="text-right font-bold text-typography-600">
              {"#" + (props.index + 1)}
            </Text>
          )}
          <Box className="absolute -left-1 -top-1">
            {props.isHost ? (
              <Icon
                as={Shield}
                size="md"
                className="fill-typography-700 text-transparent"
              />
            ) : props.isWarden ? (
              <Icon
                as={Flag}
                size="md"
                className="fill-typography-700 text-transparent"
              />
            ) : undefined}
          </Box>
        </Box>

        <VStack className="flex-shrink grow">
          <Text
            numberOfLines={1}
            className={`flex-shrink font-semibold ${props.isMe ? "text-info-700" : ""}`}
          >
            {props.user.name}
          </Text>
          <Text
            size="sm"
            className="text-typography-600"
            style={{ width: 200 }}
            numberOfLines={1}
          >
            {props.isPrivate ? "" : props.user.address}
          </Text>
        </VStack>

        <HStack reversed className="items-center">
          {hideLink ? (
            <Box className="ms-2 w-4" />
          ) : (
            <Icon as={Chevron} className="ms-2" />
          )}
          <VStack className="max-h-12 flex-wrap-reverse gap-0.5">
            {props.bags.map((b) => {
              const isReverse =
                b.number.includes("👻") || b.number.includes("⬆️");

              return (
                <Box key={b.id} className="relative">
                  <Icon as={ShoppingBagIcon} color={b.color} />
                  {isReverse ? (
                    <Icon
                      as={ArrowBigUpIcon}
                      className="absolute -bottom-1 -right-0.5 z-10 fill-slate-300"
                      size="sm"
                    />
                  ) : null}
                </Box>
              );
            })}
          </VStack>
        </HStack>
      </HStack>
    </Link>
  );
}
