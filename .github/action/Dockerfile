FROM node:12-alpine
RUN npm install releasify -g && releasify -v
COPY .github/action/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]