FROM alpine:latest
USER root
ENV MUSL_LOCALE_DEPS cmake make musl-dev gcc gettext-dev libintl 
ENV MUSL_LOCPATH /usr/share/i18n/locales/musl

RUN apk add --no-cache \
    $MUSL_LOCALE_DEPS \
    && wget https://gitlab.com/rilian-la-te/musl-locales/-/archive/master/musl-locales-master.zip \
    && unzip musl-locales-master.zip \
      && cd musl-locales-master \
      && cmake -DLOCALE_PROFILE=OFF -D CMAKE_INSTALL_PREFIX:PATH=/usr . && make && make install \
      && cd .. && rm -r musl-locales-master
RUN apk add --no-cache nodejs npm
RUN apk add --no-cache git curl

WORKDIR /app

COPY . /app
RUN npm cache clean --force
RUN rm rm -rf node_modules 
RUN rm -f package-lock.json
RUN npm install

EXPOSE 8080

ENTRYPOINT [ "node" ]
CMD [ "server.js" ]