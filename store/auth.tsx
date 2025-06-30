import { Chain, UID } from "@/api/types";
import { Bag, BulkyItem, User } from "@/api/typex2";
import { AuthStatus } from "@/types/auth_status";
import { IsChainAdmin, IsChainWarden } from "@/utils/chain";
import isBagTooOld, { IsBagTooOld } from "@/utils/is_bag_too_old";
import IsPrivate from "@/utils/is_private";
import ProviderFactory from "@/utils/ProviderFactory";
import IsPaused from "@/utils/user";
import { createContext, PropsWithChildren, useMemo, useState } from "react";

export interface RouteUser {
  user: User;
  isMe: boolean;
  isHost: boolean;
  isWarden: boolean;
  isPaused: boolean;
  isPrivate: boolean;
  routeIndex: number;
}
export type ListBag = {
  bag: Bag;
  isTooOld: IsBagTooOld;
  routeUser: RouteUser | undefined;
  localeDate: string;
};

export const [AuthStoreProvider, AuthStoreContext] = ProviderFactory(() => {
  const [authStatus, setAuthStatus] = useState(AuthStatus.Pending);
  const [authUser, setAuthUser] = useState<null | User>(null);
  const [currentChain, setCurrentChain] = useState<null | Chain>(null);
  const [currentChainUsers, setCurrentChainUsers] = useState<null | User[]>(
    null,
  );
  const [currentBags, setCurrentBags] = useState<null | Bag[]>(null);
  const [currentBulky, setCurrentBulky] = useState<null | BulkyItem[]>(null);
  const [currentChainRoute, setCurrentChainRoute] = useState<null | UID[]>(
    null,
  );

  const authStoreCurrentChainAdmin = useMemo(() => {
    return (currentChainUsers || []).filter((c) =>
      IsChainAdmin(c, currentChain?.uid),
    );
  }, [currentChainUsers, currentChain]);

  const authStoreCurrentChainWarden = useMemo(() => {
    return (currentChainUsers || [])
      .filter((c) => IsChainWarden(c, currentChain?.uid))
      .map((u) => u.uid);
  }, [currentChainUsers, currentChain]);

  const authStoreCurrentBagsPerUser = useMemo(() => {
    const result: Record<UID, Bag[]> = {};
    currentChainUsers?.forEach((u) => {
      const arr: Bag[] = currentBags?.filter((b) => b.user_uid === u.uid) || [];
      result[u.uid] = arr;
    });
    return result;
  }, [currentChainUsers, currentBags]);

  const authStoreListPausedUsers = useMemo(() => {
    const authUserUid = authUser?.uid;
    if (!authUserUid) return [];
    return (currentChainUsers || [])
      .filter((u) => IsPaused(u, authUserUid))
      .map((u) => u.uid);
  }, [authUser, currentChainUsers]);

  const authStoreAuthUserRoles = useMemo(() => {
    const authUserUid = authUser?.uid;
    if (!authUserUid)
      return { isHost: false, isChainWarden: false, isPaused: false };
    let isHost = Boolean(
      authStoreCurrentChainAdmin?.find((u) => u.uid === authUserUid),
    );
    let isPaused = Boolean(
      authStoreListPausedUsers.find((v) => v === authUserUid),
    );
    let isChainWarden = Boolean(
      authStoreCurrentChainWarden.find((uid) => uid === authUserUid),
    );

    return { isHost, isPaused, isChainWarden };
  }, [
    authStoreCurrentChainWarden,
    authStoreListPausedUsers,
    authUser,
    authStoreCurrentChainAdmin,
  ]);

  const authStoreListRouteUsers = useMemo(() => {
    if (!currentChainRoute || !currentChainUsers) return [];
    return currentChainRoute
      .reduce<RouteUser[]>((acc, uid) => {
        const user = currentChainUsers.find((u) => u.uid == uid);
        if (!user) return acc;
        const chainUID = currentChain?.uid;

        const uc = user.chains.find((uc) => uc.chain_uid === chainUID);
        const isHost = !!uc?.is_chain_admin;
        const isWarden = !!uc?.is_chain_warden;
        const isMe = uid === authUser?.uid;
        const isPaused = IsPaused(user, chainUID);
        const isPrivate = IsPrivate(user?.address || "");

        acc.push({
          user: user as User,
          isMe,
          isHost,
          isWarden,
          isPaused,
          isPrivate,
          routeIndex: acc.length,
        } satisfies RouteUser);
        return acc;
      }, [])
      .filter(({ user }) => !!user) as RouteUser[];
  }, [authUser, currentChain, currentChainRoute, currentChainUsers]);

  const authStoreListBags = useMemo(() => {
    const { isHost: isAuthUserHost } = authStoreAuthUserRoles;
    return (
      currentBags?.map((bag) => {
        const routeUser = authStoreListRouteUsers?.find(
          (item) => item.user.uid === bag.user_uid,
        );
        const isMe =
          authUser && routeUser ? routeUser.user.uid === authUser.uid : false;

        const isTooOld = isBagTooOld(bag, isAuthUserHost, isMe);

        return {
          bag,
          isTooOld,
          routeUser,
          localeDate: isTooOld.bagUpdatedAt.toDate().toLocaleDateString(),
        } satisfies ListBag;
      }) || []
    );
  }, [authUser, currentBags, authStoreAuthUserRoles, authStoreListRouteUsers]);

  function resetAuth() {
    setAuthStatus(AuthStatus.Pending);
    setAuthUser(null);
    setCurrentChain(null);
    setCurrentChainUsers(null);
    setCurrentBags(null);
    setCurrentBulky(null);
    setCurrentChainRoute(null);
  }

  return {
    // state
    authStatus,
    setAuthStatus,
    authUser,
    setAuthUser,
    currentChain,
    setCurrentChain,
    currentChainUsers,
    setCurrentChainUsers,
    currentBags,
    setCurrentBags,
    currentBulky,
    setCurrentBulky,
    currentChainRoute,
    setCurrentChainRoute,

    // memo
    authStoreCurrentChainAdmin,
    authStoreCurrentChainWarden,
    authStoreCurrentBagsPerUser,
    authStoreListPausedUsers,
    authStoreAuthUserRoles,
    authStoreListRouteUsers,
    authStoreListBags,

    // fn
    resetAuth,
  };
});
