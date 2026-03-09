import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "ridar_access_token";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  console.log("Token Saved!");
}

export async function getToken() {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  console.log("[getToken] exists?", !!token);
  return token;
}

export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  console.log("Token Cleared!");
}