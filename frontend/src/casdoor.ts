import Sdk from "casdoor-js-sdk";

export const sdkConfig = {
  serverUrl: "http://localhost:8000",
  clientId: "3e2dfba6e54a5dab8848", // TODO: Replace with your actual Client ID from Casdoor
  organizationName: "app",
  appName: "app-second-hand",
  redirectPath: "/callback",
};

export const casdoorSDK = new Sdk(sdkConfig);
