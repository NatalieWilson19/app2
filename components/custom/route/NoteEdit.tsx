import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { useEffect, useMemo, useState } from "react";
import FormattedText from "../FormattedText";
import { Box } from "@/components/ui/box";
import { UID } from "@/api/types";
import { chainChangeUserNote, chainGetUserNote } from "@/api/chain";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Textarea, TextareaInput } from "@/components/ui/textarea";
import { useInterval } from "usehooks-ts";

export default function NoteEdit(props: {
  currentChainUid: undefined | UID;
  thisUserUid: undefined | UID;
  isNoteEditable: boolean;
}) {
  const [note, setNote] = useState("");
  const queryNote = useQuery({
    queryKey: [
      "auth",
      "chain-user-note",
      props.currentChainUid,
      props.thisUserUid,
    ],
    async queryFn() {
      const res = await chainGetUserNote(
        props.currentChainUid!,
        props.thisUserUid!,
      );
      return res;
    },
    enabled: Boolean(props.currentChainUid && props.thisUserUid),
  });
  const [isInitialNote, setIsInitialNote] = useState(true);
  useEffect(() => {
    if (queryNote.data === undefined) return;
    if (isInitialNote) {
      setIsInitialNote(false);
      setNote(queryNote.data!);
    }
  }, [queryNote.data, isInitialNote]);

  const mutateNote = useMutation({
    async mutationFn(note: string) {
      if (!props.thisUserUid) throw "not logged in";
      if (!props.currentChainUid) throw "select a loop first";
      return await chainChangeUserNote(
        props.currentChainUid,
        props.thisUserUid,
        note,
      ).finally(async () => {
        await queryNote.refetch();
      });
    },
  });
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  useInterval(
    () => {
      if (queryNote.data !== note) {
        mutateNote.mutateAsync(note);
      }
    },
    isFocused ? 3000 : null,
  );

  const isDirty = useMemo(() => {
    const a = queryNote.data;
    const b = note;
    return a !== b;
  }, [queryNote.data, note]);

  function onFocus() {
    setIsFocused(true);
  }
  function onBlur() {
    setIsFocused(false);
  }

  return (
    <HStack className="shrink gap-2 px-4 py-2">
      <VStack className="shrink flex-grow gap-0.5">
        <Text bold size="sm">
          {t("notes")}
        </Text>
        {props.isNoteEditable ? (
          <Box className="relative">
            <Box
              className={`absolute right-2 top-2 z-10 h-4 w-4 rounded-full ${isInitialNote ? "bg-gray-500" : isDirty ? "bg-warning-300" : "bg-success-300"}`}
            />
            <Textarea className={`z-0 ${isDirty ? "!border-amber-600" : ""}`}>
              <TextareaInput
                className={`${isInitialNote ? "bg-gray-200" : ""}`}
                value={note}
                onBlur={onBlur}
                onFocus={onFocus}
                onChangeText={setNote}
                editable={!isInitialNote}
                submitBehavior="newline"
              />
            </Textarea>
          </Box>
        ) : (
          <Box className="min-h-28 shrink rounded border border-background-300 p-2 data-[focus=true]:border-primary-700 data-[hover=true]:border-outline-400">
            <FormattedText allowLinks content={queryNote.data || ""} />
          </Box>
        )}
      </VStack>
    </HStack>
  );
}
