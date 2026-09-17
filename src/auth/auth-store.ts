import * as SecureStore from 'expo-secure-store';

const sessionTokenKey = 'conta-familia-session-token';

export async function saveSessionToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(sessionTokenKey, token);
}

export async function getSessionToken(): Promise<string | null> {
  return SecureStore.getItemAsync(sessionTokenKey);
}

export async function clearSessionToken(): Promise<void> {
  await SecureStore.deleteItemAsync(sessionTokenKey);
}
