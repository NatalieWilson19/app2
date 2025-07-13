import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { CheckIcon, SendHorizonalIcon } from "lucide-react-native";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, View } from "react-native";

export interface AutoCompleteClassNames {
  wrapper: string;
  bar: string;
  input: string;
  suggestionList: string;
  suggestionItem: string;
  suggestionItemText: string;
}

interface GenericUser {
  name: string;
  uid: string;
}

enum SuggestingType {
  Disabled,
  Empty,
  Exists,
}

interface LowerCaseSearch<U> {
  search: string;
  value: U;
}

type IsSelected<V> = V & {
  firstSuggested?: boolean;
  selected?: boolean;
};

const re = /@([^\s、。….,?!]*)$/;

export default function ChatInput<User extends GenericUser>(props: {
  onSubmit: (
    notifyListUIDs: string[],
    input: string,
    callbackResetInput: () => void,
  ) => void;
  allPossible: User[];
}) {
  const { t } = useTranslation();
  const allPossibleLowerCaseSearch = useMemo<LowerCaseSearch<User>[]>(() => {
    return props.allPossible.map((u) => ({
      search: u.name.toLocaleLowerCase().replaceAll(/[\s-\.、。,]/g, ""),
      value: u,
    }));
  }, [props.allPossible]);
  const [input, setInput] = useState("");
  const [oldSelected, setOldSelected] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const { suggested, isSuggesting } = useMemo(() => {
    const match = re.exec(input);
    const suggested: string[] = [];
    let isSuggesting = SuggestingType.Disabled;
    if (match && match[0]) {
      isSuggesting = SuggestingType.Empty;
      if (match[1]) {
        const group1 = match[1];
        let i = 0;
        for (const { value, search } of allPossibleLowerCaseSearch) {
          if (i > 5) break;
          // console.log("search", search);
          if (search.startsWith(group1.toLocaleLowerCase())) {
            suggested.push(value.uid);
            i++;
          }
        }
        if (i > 0) {
          isSuggesting = SuggestingType.Exists;
        }
      }
    }
    return { suggested, isSuggesting };
  }, [input, allPossibleLowerCaseSearch]);
  const list = useMemo(() => {
    const list: IsSelected<User>[] = [];
    let i = 0;
    for (const uid of suggested) {
      if (selected.includes(uid)) continue;
      const user = props.allPossible.find((u) => u.uid === uid);
      if (!user) continue;
      if (i === 0) list.push({ ...user, firstSuggested: true });
      else list.push(user);
      i++;
    }
    for (const uid of selected) {
      const user = props.allPossible.find((u) => u.uid === uid);
      if (!user) continue;
      list.push({ ...user, selected: true });
    }
    for (const uid of oldSelected) {
      if (list.find((u) => u.uid === uid)) continue;
      const user = props.allPossible.find((u) => u.uid === uid);
      if (!user) continue;
      list.push({ ...user });
    }

    return list;
  }, [selected, props.allPossible, suggested, oldSelected]);

  function onPressSelected(uid: string) {
    setSelected((s) => s.filter((v) => v !== uid));
    setOldSelected((s) => [uid, ...s.filter((v) => v !== uid)]);
  }
  function onPressUnSelected(user: IsSelected<User>) {
    const match = re.exec(input);
    if (match && match[0]) {
      const inputCutIndex = input.length - match[0].length;
      setInput(
        input.slice(0, inputCutIndex) + user.name.replaceAll(".", "") + " ",
      );
    }
    setSelected((s) => [user.uid, ...s]);
  }
  function onPressAt() {
    setInput((s) => s + "@");
  }
  function onChangeText(newInput: string) {
    const oldInput = input;
    // console.log("old", oldInput, "new", newInput);
    if (re.test(oldInput)) {
      const lastChar = newInput.charAt(newInput.length - 1);
      // console.log("lastChar", lastChar);
      if (lastChar === "\n") {
        if (suggested.length) {
          const user = props.allPossible.find((u) => u.uid === suggested[0]);
          if (user) {
            onPressUnSelected(user);
            return;
          }
        }
      }
    }
    setInput(newInput);
  }
  function reset() {
    setOldSelected([]);
    setSelected([]);
    setInput("");
  }
  function onSubmit() {
    props.onSubmit(selected, input, reset);
  }

  let suggestionText: string;
  switch (isSuggesting) {
    case SuggestingType.Disabled:
      suggestionText = t("pressAtToSelect");
      break;
    case SuggestingType.Empty:
      suggestionText = t("searchPersonToNotify");
      break;
    default:
      if (suggested.length) {
        suggestionText = t("enterToSelectFirstInList");
      } else {
        suggestionText = t("selectPeopleToNotify");
      }
      break;
  }
  return (
    <View className="">
      <View className="border-y border-gray-400 bg-gray-50/70">
        <ScrollView
          keyboardShouldPersistTaps="always"
          horizontal
          className="w-full"
        >
          <View className="flex flex-row items-center gap-1 p-1">
            <Button
              onPress={onPressAt}
              className="block !h-8 !w-8 rounded-full border-gray-400 p-1 data-[active=true]:border-gray-800 data-[active=true]:bg-gray-200"
              variant="outline"
              size="sm"
            >
              <ButtonText className="text-center text-typography-700">
                @
              </ButtonText>
            </Button>
            {list.map((item) => {
              return item.selected ? (
                <Button
                  key={item.uid}
                  onPress={() => onPressSelected(item.uid)}
                  className="block !h-8 rounded-full border-amber-400 bg-amber-500 px-2.5 py-1 data-[active=true]:border-amber-300 data-[active=true]:bg-amber-800"
                  size="sm"
                >
                  <ButtonIcon as={CheckIcon} size="xs" />
                  <ButtonText className="text-center">{item.name}</ButtonText>
                </Button>
              ) : (
                <Button
                  key={item.uid}
                  onPress={() => onPressUnSelected(item)}
                  className={`block !h-8 rounded-full bg-blue-100 px-2.5 py-1 data-[active=true]:border-blue-300 data-[active=true]:bg-blue-500 ${
                    item.firstSuggested
                      ? "border-purple-400"
                      : "border-blue-400"
                  }`}
                  variant="outline"
                  size="sm"
                >
                  <ButtonText className="!w-3 text-typography-700">
                    @
                  </ButtonText>
                  <ButtonText className="text-typography-700">
                    {item.name}
                  </ButtonText>
                </Button>
              );
            })}
            <Text className="mx-1 h-5 text-sm font-bold text-gray-500 data-[active=true]:text-gray-500">
              {suggestionText}
            </Text>
          </View>
        </ScrollView>
      </View>
      <View className="flex flex-row items-end gap-2 border-b border-gray-400 p-2">
        <Input className="h-20 grow bg-white py-1">
          <InputField
            value={input}
            onChangeText={onChangeText}
            enterKeyHint="enter"
            multiline
          />
        </Input>
        <Button
          variant="solid"
          className="h-12 w-12 rounded-full rtl:-scale-x-100"
          action="primary"
          onPress={onSubmit}
        >
          <ButtonIcon key="send-icon" as={SendHorizonalIcon} />
        </Button>
      </View>
    </View>
  );
}
