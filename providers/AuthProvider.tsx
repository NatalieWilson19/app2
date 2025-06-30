import axios from "@/api/axios";
import { User } from "@/api/typex2";
import { userGetByUID, userUpdate } from "@/api/user";
import { AuthStoreContext } from "@/store/auth";
import { SavedStoreContext } from "@/store/saved";
import { AuthStatus } from "@/types/auth_status";
import { supportedLngs } from "@/utils/i18n";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { PropsWithChildren, useContext, useEffect } from "react";
import { getI18n } from "react-i18next";

const supportedLngsWithoutEN = supportedLngs.filter((s) => s != "en");

export default function AuthProvider(props: PropsWithChildren) {
  const { authStatus, authUser, setAuthStatus, setAuthUser } =
    useContext(AuthStoreContext);
  const { saved } = useContext(SavedStoreContext);
  const queryUser = useQuery({
    queryKey: ["auth", "user"],
    retry: (failureCount, error) =>
      failureCount < 3 && (error.cause as Response).status !== 401,
    async queryFn(): Promise<User | null> {
      const { userUID, token } = saved;
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
          throw res;
        });
    },
  });

  useEffect(() => {
    console.log("Auth Provider: queryUser fetchStatus", queryUser.fetchStatus);
    if (queryUser.fetchStatus === "paused") {
      setTimeout(() => {
        console.log("fetch status paused", authStatus);
        router.push("/(auth)/offline-no-data");
      }, 3000);
    }
  }, [queryUser.fetchStatus]);
  useEffect(() => {
    // console.log(
    //   "Auth Provider: $authUser set",
    //   queryUser.data?.uid || queryUser.data,
    // );
    if (queryUser.data?.uid) {
      setAuthStatus(AuthStatus.LoggedIn);
      setAuthUser(queryUser.data);
    }
  }, [queryUser.dataUpdatedAt]);
  useEffect(() => {
    if ((queryUser.error?.cause as Response)?.status === 401) {
      setAuthStatus(AuthStatus.LoggedOut);
      setAuthUser(null);
    }
  }, [queryUser.error]);

  return props.children;
}
