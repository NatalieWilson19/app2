import axios from "@/api/axios";
import { User } from "@/api/typex2";
import { userGetByUID, userUpdate } from "@/api/user";
import { authStore } from "@/store/auth";
import { savedStore } from "@/store/saved";
import { AuthStatus } from "@/types/auth_status";
import { supportedLngs } from "@/utils/i18n";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { PropsWithChildren, useEffect } from "react";
import { getI18n } from "react-i18next";

const supportedLngsWithoutEN = supportedLngs.filter((s) => s != "en");

export default function AuthProvider(props: PropsWithChildren) {
  const queryUser = useQuery({
    queryKey: ["auth", "user"],
    async queryFn(): Promise<User | null> {
      const { userUID, token } = savedStore.state;
      if (!userUID && !token) return null;

      axios.defaults.auth = "Bearer " + token;
      return await userGetByUID(undefined, userUID, {
        addApprovedTOH: true,
        addNotification: true,
      })
        .then((res) => res.data)
        .then((res) => {
          const userLanguage = res.i18n;
          const deviceLanguage = getI18n().language;
          if (
            userLanguage != deviceLanguage &&
            supportedLngsWithoutEN.includes(deviceLanguage) &&
            supportedLngs.includes(userLanguage)
          ) {
            console.info(
              "updated user language",
              "from",
              res.i18n,
              "to",
              deviceLanguage,
            );
            userUpdate({
              user_uid: res.uid,
              i18n: deviceLanguage,
            });
          }

          return res;
        })
        .catch((res: Response) => {
          if (res.status === 401) {
            return null;
          }
          throw res;
        });
    },
  });

  useEffect(() => {
    if (queryUser.fetchStatus === "paused") {
      setTimeout(() => {
        console.log("fetch status paused", authStore.state.authStatus);
        router.push("/(auth)/offline-no-data");
      }, 3000);
    }
  }, [queryUser.fetchStatus]);
  useEffect(() => {
    if (queryUser.data?.uid) {
      authStore.setState((s) => ({
        ...s,
        authStatus: AuthStatus.LoggedIn,
        authUser: queryUser.data,
      }));
    } else if (queryUser.data === null) {
      authStore.setState((s) => ({
        ...s,
        authStatus: AuthStatus.LoggedOut,
        authUser: null,
      }));
    }
  }, [queryUser.dataUpdatedAt]);

  return props.children;
}
