import { authStore, authStoreAuthUserRoles } from "@/store/auth";
import {
  ChevronDown,
  EyeOff,
  Globe2,
  Lock,
  PauseCircleIcon,
} from "lucide-react-native";
import { useStore } from "@tanstack/react-store";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import UserCard from "@/components/custom/route/UserCard";
import FormattedText from "@/components/custom/FormattedText";
import InterestedSizes, {
  Categories,
  Sizes,
} from "@/components/custom/route/InterestedSizes";
import LogoutLink from "@/components/custom/LogoutLink";
import LegalLinks from "@/components/custom/LegalLinks";
import RefreshControl from "@/components/custom/RefreshControl";
import { VStack } from "@/components/ui/vstack";
import { Switch } from "@/components/ui/switch";
import { useMemo, useState } from "react";
import usePauseDialog, { SetPause } from "@/components/custom/info/PauseDialog";
import { IsPausedHow, SetPauseRequestBody } from "@/utils/user";
import dayjs from "dayjs";
import { Badge, BadgeIcon, BadgeText } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userUpdate } from "@/api/user";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function Info() {
  const { t } = useTranslation();

  const tabBarHeight = useBottomTabBarHeight();
  const { authUser, currentChain } = useStore(authStore);
  const authUserRoles = useStore(authStoreAuthUserRoles);
  const queryClient = useQueryClient();

  const pauseState = useMemo(() => {
    let pausedFromNow = "";
    const isUserPausedHow = IsPausedHow(authUser, currentChain?.uid);
    const isUserPaused = isUserPausedHow.chain || Boolean(isUserPausedHow.user);
    if (authUser && isUserPaused) {
      let pausedDayjs = dayjs(authUser.paused_until);

      if (isUserPausedHow.chain) {
        pausedFromNow = t("onlyForThisLoop");
      } else if (isUserPausedHow.user) {
        const now = dayjs();
        if (isUserPausedHow.user.year() < now.add(20, "year").year()) {
          if (pausedDayjs.isBefore(now.add(7, "day"))) {
            pausedFromNow = t("day", {
              count: pausedDayjs.diff(now, "day") + 1,
            });
          } else {
            pausedFromNow = t("week", {
              count: pausedDayjs.diff(now, "week"),
            });
          }
        } else {
          pausedFromNow = t("untilITurnItBackOn");
        }
      }
    }
    return { pausedFromNow, isUserPausedHow, isUserPaused };
  }, [authUser, currentChain?.uid, t]);

  const mutationPause = useMutation({
    async mutationFn(o: SetPause) {
      const body = SetPauseRequestBody(
        authStore.state.authUser!.uid,
        o.isPausedOrUntil,
        o.chainUid,
      );
      await userUpdate(body);
    },
    onSettled() {
      queryClient.invalidateQueries({
        queryKey: ["auth"],
        refetchType: "all",
      });
    },
    onError(err) {
      Alert.alert("Error changing pause status", err.message);
    },
    retry: false,
  });
  const { handleOpenPause, PauseDateDialog } = usePauseDialog({
    onSubmit: mutationPause.mutateAsync,
  });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={RefreshControl()}
      style={{ paddingBottom: tabBarHeight }}
    >
      <Box className="gap-3 p-3">
        <Box className="mb-3 flex-col bg-background-0">
          <Text className="m-3 text-3xl text-black" bold>
            {t("account")}
          </Text>
          {authUser ? (
            <UserCard
              user={authUser}
              isUserPaused={authUserRoles.isPaused}
              isUserHost={authUserRoles.isHost}
              isUserWarden={authUserRoles.isChainWarden}
            />
          ) : null}

          <Pressable
            onPress={() => handleOpenPause(pauseState.isUserPausedHow)}
          >
            <HStack className="items-center gap-3 px-4 py-2">
              <VStack className="shrink flex-grow items-start">
                <Text bold size="sm">
                  {t("pauseParticipation")}
                </Text>
                <Text>
                  {pauseState.isUserPaused
                    ? t("yourParticipationIsPausedClick")
                    : t("setTimerForACoupleOfWeeks")}
                </Text>
                {pauseState.pausedFromNow ? (
                  <Badge size="md" variant="solid" action="muted">
                    <BadgeIcon as={PauseCircleIcon} className="me-2" />
                    <BadgeText>{pauseState.pausedFromNow}</BadgeText>
                  </Badge>
                ) : null}
              </VStack>
              <Switch
                value={pauseState.isUserPausedHow.sum}
                trackColor={{ true: "#EF4444", false: null }}
              ></Switch>
            </HStack>
          </Pressable>

          <PauseDateDialog />
        </Box>

        <Box className="flex-col bg-background-0">
          <Link asChild href="/(auth)/select-chain">
            <Pressable>
              <Box className="flex-col px-3 pb-4 pt-2">
                <Text bold size="sm">
                  {t("selectALoop")}
                </Text>
                <HStack className="items-center justify-between">
                  <Text className="text-3xl text-black" bold>
                    {currentChain?.name}
                  </Text>
                  <Icon as={ChevronDown} size="xl" />
                </HStack>
              </Box>
            </Pressable>
          </Link>

          <Box className="flex-row items-center bg-warning-200 p-3">
            <Icon as={Lock} className="me-2" />
            <Text className="me-3">{t("closed")}</Text>
            <Icon as={EyeOff} className="me-2" />
            <Text className="me-3">{t("locked")}</Text>
          </Box>
          {currentChain ? (
            <InterestedSizes
              categories={currentChain.genders as Categories[]}
              sizes={currentChain.sizes as Sizes[]}
            />
          ) : null}
          {currentChain?.description ? (
            <Box className="p-3">
              <Text size="sm" bold>
                {t("description")}
              </Text>
              <FormattedText content={currentChain.description} />
            </Box>
          ) : null}
          {authUserRoles.isHost ? (
            <Link asChild href="https://clothingloop.org/">
              <Pressable>
                <Box className="flex-row items-center gap-3 p-3">
                  <Text className="flex-grow">{t("goToAdminPortal")}</Text>
                  <Icon as={Globe2} />
                </Box>
              </Pressable>
            </Link>
          ) : null}
        </Box>
        <LogoutLink />
        <LegalLinks />
      </Box>
    </ScrollView>
  );
}
