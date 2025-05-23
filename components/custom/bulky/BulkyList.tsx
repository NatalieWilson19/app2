import { BulkyItem } from "@/api/typex2";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useMemo, useState } from "react";
import { HStack } from "@/components/ui/hstack";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useStore } from "@tanstack/react-store";
import { authStore, authStoreAuthUserRoles } from "@/store/auth";
import { router } from "expo-router";
import { bulkyItemRemove } from "@/api/bulky";
import { useQueryClient } from "@tanstack/react-query";
import { t } from "i18next";
import BulkyListItem from "./BulkyListItem";
export default function BulkyList(props: { bulkyList: BulkyItem[] }) {
  const [selected, setSelected] = useState<BulkyItem | null>(null);
  const { showActionSheetWithOptions } = useActionSheet();
  const authUser = useStore(authStore, (s) => s.authUser);
  const queryClient = useQueryClient();
  const isHost = useStore(authStoreAuthUserRoles, (s) => s.isHost);
  const cols = useMemo(() => {
    const col1: BulkyItem[] = [];
    let col1mass = 0;
    const col2: BulkyItem[] = [];
    let col2mass = 0;
    props.bulkyList
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .forEach((bulky, i) => {
        if (col1mass > col2mass) {
          col2.push(bulky);
          col2mass += bulky.image_url ? 2 : 1;
        } else {
          col1.push(bulky);
          col1mass += bulky.image_url ? 2 : 1;
        }
      });
    return [col1, col2];
  }, [props.bulkyList]);

  function bulkyOptionsHandler(bulky: BulkyItem) {
    if (!(bulky?.user_uid === authUser?.uid || isHost)) return;

    const options = [t("cancel"), t("edit"), t("delete")];

    showActionSheetWithOptions(
      {
        options,
        destructiveButtonIndex: 2,
        cancelButtonIndex: 0,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          // edit
          router.push(`/(auth)/(tabs)/bags/bulky/edit/${bulky.id}/`);
        } else if (buttonIndex === 2) {
          // delete
          Alert.alert(
            t("deleteBulkyItem"),
            t("areYouSureYouWantToDeleteThisBulkyItem"),
            [
              {
                text: t("delete"),
                style: "destructive",
                onPress() {
                  bulkyItemRemove(bulky.chain_uid, bulky.user_uid, bulky.id);
                  queryClient.invalidateQueries({
                    queryKey: ["auth", "chain-bags", bulky.chain_uid],
                    exact: true,
                  });
                },
              },
              {
                text: t("cancel"),
                style: "cancel",
              },
            ],
          );
        }
      },
    );
  }
  return (
    <>
      <HStack className="pb-6 pt-1">
        {cols.map((list, i) => (
          <VStack key={i} className="w-1/2">
            {list.map((bulky) => {
              const isEditable = bulky.user_uid === authUser?.uid || isHost;
              return (
                <BulkyListItem
                  bulky={bulky}
                  key={bulky.id}
                  setSelected={() => setSelected(bulky)}
                  isEditable={isEditable}
                  onOpenOptions={() => bulkyOptionsHandler(bulky)}
                />
              );
            })}
          </VStack>
        ))}
      </HStack>
      {selected && (
        <SafeAreaProvider>
          <SafeAreaView className="flex-1 justify-center align-middle">
            <Modal
              animationType="fade"
              transparent={true}
              visible={!!selected}
              onRequestClose={(open) => !open && setSelected(null)}
            >
              <Pressable
                onPress={() => setSelected(null)}
                className="flex-1 items-center justify-center bg-white/70"
              >
                <Pressable
                  onPress={() => {}} // prevent closing when tapping inside the modal
                  className="m-5 w-[90%] max-w-xl rounded-2xl bg-white p-8 shadow-lg"
                >
                  <Pressable
                    onPress={() => setSelected(null)}
                    className="mb-2 self-end"
                  >
                    <Text className="text-md mb-2 text-right text-primary-500">
                      {t("close")}
                    </Text>
                  </Pressable>

                  <VStack>
                    {selected.image_url && (
                      <Image
                        className="mb-2 h-96 w-full"
                        alt=""
                        source={{
                          uri: selected.image_url,
                        }}
                      />
                    )}
                    <Text className="mb-2 text-2xl font-bold">
                      {selected.title}
                    </Text>
                    <View className="grow-1 max-h-80">
                      <ScrollView>
                        <Pressable>
                          <Text>{selected.message}</Text>
                        </Pressable>
                      </ScrollView>
                    </View>
                  </VStack>
                </Pressable>
              </Pressable>
            </Modal>
          </SafeAreaView>
        </SafeAreaProvider>
      )}
    </>
  );
}
