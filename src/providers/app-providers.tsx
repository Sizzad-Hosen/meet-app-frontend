"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/redux/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
