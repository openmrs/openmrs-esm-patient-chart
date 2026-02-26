import { type APIRequestContext } from '@playwright/test';

export const restoreLanguage = async (api: APIRequestContext, userUuid: string) => {
  await api.post(`user/${userUuid}`, {
    data: {
      defaultLocale: 'en',
    },
  });
};

export async function getCurrentUserUuid(api: APIRequestContext): Promise<string> {
  const response = await api.get('/ws/rest/v1/session');
  const session = await response.json();
  return session.user.uuid;
}
