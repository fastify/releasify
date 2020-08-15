FROM node:12-alpine
# The action uses the last released version of releasify
RUN npm install releasify -g && releasify -v
COPY .github/action/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]