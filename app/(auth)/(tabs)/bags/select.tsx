import { authStore, authStoreListRouteUsers } from "@/store/auth";
import { useStore } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";
import { Text } from "../../../../components/ui/text";
import { RadioGroup } from "../../../../components/ui/radio";
import { useEffect, useLayoutEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { bagPut } from "@/api/bag";
import { UID } from "@/api/types";
import { useForm } from "@tanstack/react-form";
import { catchErrThrow401 } from "@/utils/handleRequests";
import DatePickerSingleItem from "../../../../components/custom/DatePicker";
import { FlatList, Pressable, View } from "react-native";
import useFilteredRouteUsers from "@/hooks/useFilteredRouteUsers";
import BagsSelectRadioItem from "../../../../components/custom/bags/BagsSelectRadioItem";
import { Box } from "@/components/ui/box";
import { Link, router, useNavigation } from "expo-router";
import { selectedBagStore } from "@/store/selected-bag";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { LucideCircleX, LucideSearch } from "lucide-react-native";
import { useDebounce } from "@uidotdev/usehooks";

export default function BagsSheet() {
  const listRouteUsers = useStore(authStoreListRouteUsers);
  const { selectedBag } = useStore(selectedBagStore);

  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentChain, authUser } = useStore(authStore);
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const mutateBags = useMutation({
    async mutationFn(value: { userUid: UID; date: Date }) {
      return bagPut({
        chain_uid: currentChain!.uid,
        user_uid: authUser!.uid,
        bag_id: selectedBag!.bag.id,
        holder_uid: value.userUid,
        updated_at: value.date.toISOString(),
      })
        .then((res) => res.data)
        .catch(catchErrThrow401);
    },
    onSuccess(data) {
      queryClient.invalidateQueries({
        queryKey: ["auth", "chain-bags", currentChain!.uid],
        exact: true,
        refetchType: "all",
      });
    },
    onError(error) {
      queryClient.invalidateQueries();
    },
  });
  const form = useForm({
    defaultValues: { userUid: selectedBag!.bag.user_uid, date: new Date() },
    async onSubmit({ value }) {
      if (!value.userUid) return;
      router.back();
      await mutateBags.mutateAsync(value);
    },
  });
  useEffect(() => {
    form.setFieldValue("userUid", selectedBag!.bag.user_uid);
  }, [selectedBag!.bag.user_uid]);
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Link href="..">
          <Text className="text-error-600">{t("close")}</Text>
        </Link>
      ),
      title: t("changeBagHolder"),
      headerRight: () => (
        <Pressable onPress={form.handleSubmit}>
          <Text className="text-primary-600">{t("change")}</Text>
        </Pressable>
      ),
    });
  }, [t]);

  const debounceSearch = useDebounce(search, 700);
  const sortedListRouteUsers = useFilteredRouteUsers(
    listRouteUsers,
    {},
    "routeForMe",
    debounceSearch,
  );

  function handleClose() {
    router.back();
  }

  const safeInsets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingBottom: safeInsets.bottom }}
    >
      <Box className="p-3" style={{ backgroundColor: selectedBag?.bag.color }}>
        <Input className="bg-white">
          <InputField
            value={search}
            onChangeText={setSearch}
            placeholder={t("search")}
            className="placeholder:text-right"
          />
          <InputSlot className="pr-3" onPress={() => setSearch("")}>
            {search ? (
              <InputIcon as={LucideCircleX} className="text-error-600" />
            ) : (
              <InputIcon as={LucideSearch} />
            )}
          </InputSlot>
        </Input>
      </Box>
      <form.Field name="date">
        {(field) => (
          <DatePickerSingleItem
            title={t("dateOfDelivery")}
            value={field.state.value}
            setValue={field.setValue}
          />
        )}
      </form.Field>
      <Box className="h-full shrink">
        <form.Field name="userUid">
          {(field) => (
            <RadioGroup
              aria-labelledby="Select one item"
              value={field.state.value}
              onChange={field.setValue}
            >
              <FlatList
                className="shrink"
                data={sortedListRouteUsers}
                keyExtractor={(item) => String(item.routeUser.routeIndex)}
                renderItem={({ item }) => (
                  <BagsSelectRadioItem
                    key={item.routeUser.routeIndex}
                    routeUser={item.routeUser}
                  />
                )}
              />
            </RadioGroup>
          )}
        </form.Field>
      </Box>
    </View>
  );
}
