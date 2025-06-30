import FormLabel from "@/components/custom/FormLabel";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useNavigation } from "expo-router";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { Pressable, ScrollView } from "react-native";
import { useForm } from "@tanstack/react-form";
import { AuthStoreContext } from "@/store/auth";
import { Input, InputField } from "@/components/ui/input";
import { HStack } from "@/components/ui/hstack";
import { Button, ButtonText } from "@/components/ui/button";
import { bagPut } from "@/api/bag";
import { useQueryClient } from "@tanstack/react-query";
import { Bag } from "@/api/typex2";
import ColorSelect from "../ColorSelect";

const bagColors = [
  "#C9843E",
  "#AD8F22",
  "#79A02D",
  "#66926E",
  "#199FBA",
  "#6494C2",
  "#1467B3",
  "#A899C2",
  "#513484",
  "#B37EAD",
  "#B76DAC",
  "#F57BB0",
  "#A35C7B",
  "#E38C95",
  "#C73643",
  "#7D7D7D",
  "#3C3C3B",
];

const emojis = ["👻", "🐰", "👟", "📖", "⬆️"];

export default function BagPatch(props: { bag: Bag | null }) {
  const { t } = useTranslation();
  const { authUser, currentChain } = useContext(AuthStoreContext);
  const chainUid = currentChain!.uid;
  const queryClient = useQueryClient();
  //   const listBags = useStore(authStoreListBags);
  const navigation = useNavigation();
  const form = useForm({
    defaultValues: {
      number: props.bag?.number || "",
      color: props.bag?.color || bagColors[9],
    },
    async onSubmit({ value }) {
      await bagPut({
        chain_uid: chainUid,
        user_uid: authUser!.uid,
        bag_id: props.bag?.id,
        number: value.number,
        holder_uid: authUser!.uid,
        color: value.color,
      });
      queryClient.invalidateQueries({
        queryKey: ["auth", "chain-bags", chainUid],
        exact: true,
      });
      navigation.goBack();
    },
  });

  useEffect(() => {
    if (props.bag) {
      form.setFieldValue("number", props.bag.number);
      form.setFieldValue("color", props.bag.color);
    } else {
      form.setFieldValue("number", "");
      form.setFieldValue("color", bagColors[9]);
    }
  }, [props.bag]);

  useEffect(() => {
    navigation.setOptions({
      title: t("bags"),
      headerRight: () => (
        <Pressable onPress={form.handleSubmit} className="px-2">
          <Text size="xl" className="text-primary-500">
            {props.bag ? t("save") : t("publish")}
          </Text>
        </Pressable>
      ),
    } satisfies NativeStackNavigationOptions);
  }, [navigation, t, props.bag]);

  function handlePressEmoji(
    emoji: string,
    setValue: (fn: (s: string) => string) => void,
  ) {
    setValue((s) => {
      if (s.includes(" " + emoji)) {
        return s.replace(" " + emoji, "");
      } else if (s.includes(emoji)) {
        return s.replace(emoji, "");
      } else {
        return s + " " + emoji;
      }
    });
  }

  return (
    <ScrollView className="bg-background-0">
      <VStack className="gap-3 p-3">
        <form.Field name="number">
          {(field) => (
            <>
              <FormLabel label={t("bagName")}>
                <>
                  <Input>
                    <InputField
                      value={field.state.value}
                      onChangeText={field.setValue}
                    />
                  </Input>
                </>
              </FormLabel>
              <HStack className="gap-2">
                {emojis.map((emoji) => {
                  const isSelected = field.state.value.includes(emoji);
                  return (
                    <Button
                      key={emoji}
                      className="h-10 w-10 rounded-full bg-typography-50 p-0"
                      onPress={() => handlePressEmoji(emoji, field.setValue)}
                      // isPressed
                      // variant="outline"
                      isDisabled={isSelected}
                      action="default"
                    >
                      <ButtonText>{emoji}</ButtonText>
                    </Button>
                  );
                })}
              </HStack>
            </>
          )}
        </form.Field>
        <FormLabel label={t("bagColor")}>
          <form.Field name="color">
            {(field) => (
              <ColorSelect
                colors={bagColors}
                value={field.state.value}
                setValue={field.setValue}
              />
            )}
          </form.Field>
        </FormLabel>
        <FormLabel label={t("bagHolder")}>
          <Text size="xl">{authUser?.name || ""}</Text>
        </FormLabel>
      </VStack>
    </ScrollView>
  );
}
