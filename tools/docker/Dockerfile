FROM node:14-stretch

# Create app directory
WORKDIR /home/app

COPY . ./

COPY ./package*.json ./

#RUN git submodule init
#RUN git submodule update
#RUN cd ./src/modules/react-joyride && npm run build

RUN npm install

ENTRYPOINT ./start.sh
