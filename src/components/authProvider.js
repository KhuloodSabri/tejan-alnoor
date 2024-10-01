import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { authConfig } from "../utils/auth";

export default function AuthProvider({ redirectPath, children }) {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(
      appState && appState.returnTo
        ? appState.returnTo
        : window.location.pathname
    );
  };

  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: `${window.location.origin}/tejan-alnoor${
          redirectPath ? "/" : ""
        }${redirectPath ?? ""}`,
        audience: authConfig.audience,
      }}
    >
      {children}
    </Auth0Provider>
  );
}
