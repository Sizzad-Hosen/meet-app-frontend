"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { hydrateCredentials } from "@/redux/features/auth/authSlice";
import { store } from "@/redux/store";

function AuthHydrator() {
  useEffect(() => {
    const raw = window.localStorage.getItem("meet-app-auth");

    if (raw) {
      store.dispatch(hydrateCredentials(JSON.parse(raw)));
    }
  }, []);

  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
