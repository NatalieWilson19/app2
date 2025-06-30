import { bagRemove } from "@/api/bag";
import { Bag } from "@/api/typex2";
import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { AuthStoreContext, ListBag } from "@/store/auth";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { ShoppingBag, EllipsisIcon } from "lucide-react-native";
import React, { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable } from "react-native";
import BagsListItemUser from "./BagListItemUser";

export default function BagsList(props: {
  listBags: ListBag[];
  showUser?: boolean;
  showBagOptions?: boolean;
  onPressBag: (item: ListBag) => void;
}) {
  const { t } = useTranslation();
  const { showActionSheetWithOptions } = useActionSheet();
  const queryClient = useQueryClient();
  const { authUser, currentChain } = useContext(AuthStoreContext);
  const mutateBagDelete = useMutation({
    async mutationFn(bagId: number) {
      return bagRemove(currentChain!.uid, authUser!.uid, bagId).finally(() => {
        queryClient.invalidateQueries({
          queryKey: ["auth", "chain-bags", currentChain!.uid],
          exact: true,
        });
      });
    },
  });

  function openBagDeleteDialog(bag: Bag) {
    Alert.alert(
      t("deleteBag"),
      t("areYouSureYouWantToDeleteBag", {
        name: bag.number,
      }),
      [
        {
          text: t("delete"),
          style: "destructive",
          onPress() {
            if (mutateBagDelete.isPending) return;
            mutateBagDelete.mutateAsync(bag.id);
          },
        },
        {
          text: t("cancel"),
          style: "cancel",
        },
      ],
    );
  }

  function openBagOptionsActionsheet(bag: Bag) {
    showActionSheetWithOptions(
      {
        title: bag.number,
        options: [t("edit"), t("delete"), t("cancel")],
        destructiveButtonIndex: 1,
        cancelButtonIndex: 2,
      },
      (selectedIndex) => {
        switch (selectedIndex) {
          case 0:
            // Edit
            router.push(`/(auth)/bags/edit/${bag.id}/`);
            break;
          case 1:
            // Delete

            openBagDeleteDialog(bag);
            break;
        }
      },
    );
  }

  return (
    <>
      <Box className="mb-1 flex w-full flex-row flex-wrap">
        {props.listBags?.map((item) => {
          return (
            <Card
              key={item.bag.id}
              id={"bag-" + item.bag.id}
              className="relative w-1/2 flex-col bg-transparent p-1"
            >
              {props.showBagOptions ? (
                <Pressable
                  className="m absolute right-0 top-0 z-10 px-2 pt-2"
                  onPress={() => openBagOptionsActionsheet(item.bag)}
                >
                  <Box className="h-10 w-10 items-center justify-center">
                    <Icon as={EllipsisIcon} color="#fff" size="xl" />
                  </Box>
                </Pressable>
              ) : null}
              <Box className="relative">
                <Pressable
                  className={`flex aspect-square flex-col items-center justify-center gap-1 p-4 ${props.showUser ? "rounded-t-md" : "rounded-md"}`}
                  onPress={() => props.onPressBag(item)}
                  style={{ backgroundColor: item.bag.color }}
                >
                  <HStack className="absolute left-1 top-1 items-center gap-1.5">
                    <Text className="text-white" size="lg">
                      {item.localeDate}
                    </Text>
                    {item.isTooOld.isBagTooOldMe ? (
                      <Box
                        className="h-3 w-3 rounded-full bg-error-600"
                        key="late-me"
                      />
                    ) : item.isTooOld.isBagTooOldHost ? (
                      <Box
                        className="h-3 w-3 rounded-full bg-warning-400"
                        key="late-other"
                      />
                    ) : null}
                  </HStack>
                  <Icon
                    as={ShoppingBag}
                    //@ts-ignore
                    size="5xl"
                    width={60}
                    height={60}
                    color="white"
                    className="mt-4"
                  />

                  <Text
                    numberOfLines={1}
                    className="text-lg font-bold text-white"
                  >
                    {item.bag.number}
                  </Text>
                </Pressable>
              </Box>
              {props.showUser ? (
                <BagsListItemUser
                  isPrivate={item.routeUser?.isPrivate || false}
                  routeIndex={item.routeUser?.routeIndex}
                  user={item.routeUser?.user}
                />
              ) : null}
            </Card>
          );
        })}
      </Box>
    </>
  );
}
