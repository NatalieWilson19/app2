import { BulkyItem } from "@/api/typex2";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { messagingApps } from "@/constants/MessagingApps";
import { AuthStoreContext } from "@/store/auth";
import { t } from "i18next";
import { XCircleIcon } from "lucide-react-native";
import { useContext, useMemo } from "react";
import {
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  View,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function BulkySelectedModal(props: {
  selected: BulkyItem;
  setSelected: (s: BulkyItem | null) => void;
}) {
  const { currentChainUsers } = useContext(AuthStoreContext);
  const user = useMemo(() => {
    return currentChainUsers?.find((u) => u.uid === props.selected.user_uid);
  }, [props.selected, currentChainUsers]);
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 justify-center align-middle">
        <Modal
          animationType="fade"
          transparent={true}
          visible={!!props.selected}
          onRequestClose={(open) => !open && props.setSelected(null)}
        >
          <Pressable
            onPress={() => props.setSelected(null)}
            className="flex-1 items-center justify-center bg-white/70"
          >
            <Pressable
              onPress={() => {}} // prevent closing when tapping inside the modal
              className="m-5 w-[90%] max-w-xl rounded-2xl bg-white p-8 shadow-lg"
            >
              <Pressable
                onPress={() => props.setSelected(null)}
                className={`self-end ${Platform.OS == "android" ? "mb-4" : "mb-2"}`}
              >
                {Platform.OS == "android" ? (
                  <Icon as={XCircleIcon} />
                ) : (
                  <Text className="text-md mb-2 text-right text-primary-500">
                    {t("close")}
                  </Text>
                )}
              </Pressable>

              <VStack>
                {props.selected.image_url && (
                  <Image
                    className="mb-2 h-96 w-full"
                    alt=""
                    source={{
                      uri: props.selected.image_url,
                    }}
                  />
                )}
                <Text className="mb-2 text-2xl font-bold">
                  {props.selected.title}
                </Text>
                <View className="grow-1 max-h-80">
                  <ScrollView>
                    <Pressable>
                      <Text>{props.selected.message}</Text>
                    </Pressable>
                  </ScrollView>
                </View>
                {user ? (
                  <VStack className="pt-3">
                    <Text bold className="text-center text-typography-500">
                      {user.name}
                    </Text>
                    {user.phone_number ? (
                      <HStack
                        key="im"
                        className="justify-center gap-4 px-3 pt-2"
                      >
                        {messagingApps.map((m) => {
                          const link = m.link(user.phone_number);
                          return (
                            <Pressable
                              key={m.key}
                              onPress={() => Linking.openURL(link)}
                            >
                              <Box
                                className="aspect-square w-14 items-center justify-center rounded-full shadow-hard-1"
                                style={{ backgroundColor: m.bgColor }}
                              >
                                <m.source width={32} height={32} color="#fff" />
                              </Box>
                            </Pressable>
                          );
                        })}
                      </HStack>
                    ) : null}
                  </VStack>
                ) : null}
              </VStack>
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
