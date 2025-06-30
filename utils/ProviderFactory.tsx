import { Context, createContext, JSX, PropsWithChildren } from "react";

/**
 * Provider Factory create a react provider component and context
 * @param providerHook a function which can include react hooks and returns values of the context
 * @returns [provider, context]
 */
export default function ProviderFactory<T extends {}>(
  providerHook: () => T,
): [({ children }: PropsWithChildren) => JSX.Element, Context<T>] {
  const context = createContext<T>({} as T);
  const provider = ({ children }: PropsWithChildren) => {
    const value = providerHook();
    return <context.Provider value={value}>{children}</context.Provider>;
  };
  return [provider, context];
}
