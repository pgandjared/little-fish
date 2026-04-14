import Sdk from "casdoor-js-sdk";

export const sdkConfig = {
  serverUrl: "http://localhost:8000",
  clientId: "7ccfa99a1769a710bc02",
  organizationName: "zp",
  appName: "second-hand",
  redirectPath: "/callback",
};

export const casdoorSDK = new Sdk(sdkConfig);
