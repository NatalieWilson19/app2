import FormLabel from "@/components/custom/FormLabel";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useNavigation } from "expo-router";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import {
  Pressable,
  ScrollView,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { useForm } from "@tanstack/react-form";
import { AuthStoreContext } from "@/store/auth";
import { Input, InputField } from "@/components/ui/input";
import { Button, ButtonText } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { BulkyItem } from "@/api/typex2";
import * as ImagePicker from "expo-image-picker";
import { uploadImage } from "@/api/imgbb";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { bulkyItemPut } from "@/api/bulky";

export default function BulkyPatch(props: { BulkyItem: BulkyItem | null }) {
  const { t } = useTranslation();

  const { authUser, currentChain } = useContext(AuthStoreContext);
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [afterSubmit, setAfterSubmit] = useState(false);

  const form = useForm({
    defaultValues: {
      title: props.BulkyItem?.title || "",
      message: props.BulkyItem?.message || "",
      image: props.BulkyItem?.image_url || "",
    },

    async onSubmit({ value }) {
      if (!value.image) return;
      await bulkyItemPut({
        id: props.BulkyItem?.id,
        chain_uid: currentChain!.uid,
        user_uid: authUser!.uid,
        title: value.title,
        message: value.message,
        image_url: value.image,
      })
        .catch((err) => {
          console.error("Error during form submission", err);
          throw err;
        })
        .finally(() => {
          setAfterSubmit(true);
          queryClient.invalidateQueries({
            queryKey: ["auth", "chain-bags", currentChain!.uid],
            exact: true,
          });
        });

      navigation.goBack();
    },
  });

  const pickImage = async (setValue: (val: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setLoading(true);

      const _image = result.assets[0].base64;
      if (_image && result.assets[0].fileSize)
        uploadImgDB(_image, result.assets[0].fileSize, setValue);
    }
  };

  const uploadImgDB = async (
    Base64: string,
    fileSize: number,
    setValue: (val: string) => void,
  ) => {
    let result = await uploadImage(Base64, fileSize);

    setValue(result.data.image);
    setLoading(false);
  };
  useEffect(() => {
    navigation.setOptions({
      title: `${props.BulkyItem ? t("updateBulkyItem") : t("createBulkyItem")}`,
      headerRight: () => (
        <Pressable
          disabled={loading}
          onPress={form.handleSubmit}
          className="px-2"
        >
          <Text
            size="xl"
            className={`text-primary-500 ${loading ? "opacity-50" : ""}`}
          >
            {props.BulkyItem ? t("save") : t("publish")}
          </Text>
        </Pressable>
      ),
    } satisfies NativeStackNavigationOptions);
  }, [navigation, t, props.BulkyItem, loading]);
  return (
    <>
      {afterSubmit ? (
        <View className="h-[100vh] flex-1 items-center justify-center bg-background-0">
          <ActivityIndicator color="#5f9c8a" size="large" />
        </View>
      ) : (
        <ScrollView className="bg-background-0">
          <VStack className="gap-3 p-3">
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) =>
                  value === "" ? "Title is required" : undefined,
              }}
            >
              {(field) => (
                <FormLabel
                  label={t("title")}
                  error={field.state.meta.errors[0]}
                >
                  <>
                    <Input>
                      <InputField
                        value={field.state.value}
                        onChangeText={field.setValue}
                      />
                    </Input>
                  </>
                </FormLabel>
              )}
            </form.Field>
            <form.Field
              name="message"
              validators={{
                onChange: ({ value }) =>
                  value === "" ? "Description is required" : undefined,
              }}
            >
              {(field) => (
                <FormLabel
                  label={t("description")}
                  error={field.state.meta.errors[0]}
                >
                  <>
                    <Textarea>
                      <TextareaInput
                        multiline
                        numberOfLines={4}
                        value={field.state.value}
                        onChangeText={field.setValue}
                      />
                    </Textarea>
                  </>
                </FormLabel>
              )}
            </form.Field>
            <View>
              <form.Field
                name="image"
                validators={{
                  onChange: ({ value }) =>
                    value === "" ? "Image is required" : undefined,
                }}
              >
                {(field) => (
                  <FormLabel
                    label={t("image")}
                    error={field.state.meta.errors[0]}
                  >
                    <Button onPress={() => pickImage(field.setValue)}>
                      <ButtonText>
                        <Text className="text-white">
                          {loading
                            ? ""
                            : field.state.value
                              ? t("selectNewImage")
                              : t("selectImage")}
                        </Text>
                      </ButtonText>
                      {loading && <ActivityIndicator color="#ffffff" />}
                    </Button>
                    {field.state.value && (
                      <Image
                        source={{ uri: field.state.value }}
                        style={{
                          width: "100%",
                          height: 200,
                          resizeMode: "contain",
                        }}
                        className="mx-auto mt-4"
                        alt="Current bulky item image"
                      />
                    )}
                  </FormLabel>
                )}
              </form.Field>
            </View>
          </VStack>
        </ScrollView>
      )}
    </>
  );
}
