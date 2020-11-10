FROM centos:8

# Create app directory
WORKDIR /usr/src/gateway-svc

ADD . ./
RUN dnf install -y gcc-c++ make
RUN curl -sL https://rpm.nodesource.com/setup_14.x | bash -
RUN dnf install -y nodejs

RUN curl --silent --location https://dl.yarnpkg.com/rpm/yarn.repo | tee /etc/yum.repos.d/yarn.repo
RUN dnf install -y yarn

RUN yarn install

EXPOSE 4002
CMD [ "yarn", "dev" ]