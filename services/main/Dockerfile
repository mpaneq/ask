FROM ruby:3.1.0-alpine 

RUN apk -U add --no-cache \
build-base \
git \
postgresql-dev \
postgresql-client \
libxml2-dev \
libxslt-dev \
nodejs \
yarn \
imagemagick \
tzdata \
less \
&& rm -rf /var/cache/apk/*

WORKDIR /app
COPY . /app/

ENV BUNDLE_PATH /gems
RUN yarn install
RUN bundle install

ENTRYPOINT [ "bin/rails" ]
CMD ["s", "-b", "0.0.0.0", "-p", "3001"]

EXPOSE 3001