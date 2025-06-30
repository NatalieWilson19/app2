import { chainGet } from "@/api/chain";
import { AuthStoreContext } from "@/store/auth";
import { SavedStoreContext } from "@/store/saved";
import { useForm } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import { useContext, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { SafeAreaView, ScrollView, View } from "react-native";
import {
  Radio,
  RadioGroup,
  RadioIcon,
  RadioIndicator,
  RadioLabel,
} from "@/components/ui/radio";
import { CircleIcon } from "lucide-react-native";
import { router, useNavigation } from "expo-router";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Button, ButtonText } from "@/components/ui/button";
import LogoutLink from "@/components/custom/LogoutLink";
import LegalLinks from "@/components/custom/LegalLinks";

export default function SelectChain() {
  const { t } = useTranslation();
  const { authUser, currentChain } = useContext(AuthStoreContext);
  const { setSaved } = useContext(SavedStoreContext);
  const navigation = useNavigation();

  const { data: listOfChains } = useQuery({
    queryKey: [
      "auth",
      "user-chains",
      authUser?.uid,
      authUser?.chains?.join(","),
    ],
    async queryFn() {
      if (!authUser?.chains.length) {
        return [];
      }

      const promises = authUser.chains.map((uc) =>
        chainGet(uc.chain_uid).then((res) => ({
          is_approved: uc.is_approved,
          ...res.data,
        })),
      );
      return await Promise.all(promises);
    },
  });
  const form = useForm({
    defaultValues: {
      chainUid: "",
    },
    async onSubmit({ value }) {
      if (!value.chainUid) throw "Please select a Loop";
      setSaved((s) => ({ ...s, chainUID: value.chainUid }));
      router.replace("/(auth)/(tabs)/(index)");
    },
  });
  useLayoutEffect(() => {
    if (currentChain) {
      form.setFieldValue("chainUid", currentChain.uid);
      navigation.setOptions({
        headerBackTitle: currentChain.name.slice(0, 8) + "...",
        title: t("selectALoop"),
      } satisfies NativeStackNavigationOptions);
    }
  }, [currentChain?.uid, navigation, t]);

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      {currentChain ? null : (
        <>
          <LogoutLink />
          <LegalLinks />
        </>
      )}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        className="flex flex-1 flex-col-reverse"
      >
        <form.Field name="chainUid">
          {(field) => (
            <RadioGroup
              aria-labelledby="Select one item"
              value={field.state.value}
              onChange={(e) => {
                field.setValue(e);
              }}
            >
              {listOfChains?.map((c) => {
                const isDisabled =
                  (c.is_app_disabled ||
                    c.published == false ||
                    c.is_approved == false) &&
                  c.name != "Test Loop";
                return (
                  <Radio
                    value={c.uid}
                    isDisabled={isDisabled}
                    key={c.uid}
                    size="md"
                    className="items-center justify-between px-4 py-2"
                  >
                    <View className="flex flex-col">
                      <RadioLabel className="text-lg">{c.name}</RadioLabel>
                      {isDisabled ? (
                        <RadioLabel>{t("disabled")}</RadioLabel>
                      ) : null}
                    </View>
                    <RadioIndicator>
                      <RadioIcon as={CircleIcon} />
                    </RadioIndicator>
                  </Radio>
                );
              })}
            </RadioGroup>
          )}
        </form.Field>
      </ScrollView>
      <Button onPress={form.handleSubmit} size="xl" className="m-6">
        <ButtonText>{t("select")}</ButtonText>
      </Button>
    </SafeAreaView>
  );
}
