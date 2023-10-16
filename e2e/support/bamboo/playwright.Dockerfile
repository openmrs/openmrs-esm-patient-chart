# The image version should match the Playwright version specified in the package.json file
FROM mcr.microsoft.com/playwright:v1.39.0-jammy

ARG USER_ID
ARG GROUP_ID

RUN if ! getent group $GROUP_ID > /dev/null; then \
    groupadd -g $GROUP_ID myusergroup; \
fi

RUN useradd -u $USER_ID -g $GROUP_ID -m playwrightuser

USER playwrightuser

