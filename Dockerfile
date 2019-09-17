FROM node:6.9.5

RUN groupadd -r app && useradd -r -g app app

RUN apt-get update

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install --production
COPY . /usr/src/app
RUN chown -R app:app /usr/src/app/

ENV NODE_ENV production
ENV CONTAINERIZED true
ENV MYKI_PORT 5000
EXPOSE 5000

CMD ["/usr/local/bin/node","/usr/src/app/index.js"]
