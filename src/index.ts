require('dotenv').config();
import { Keystone } from '@keystonejs/keystone';
import { PasswordAuthStrategy } from '@keystonejs/auth-password';
import { Text, Checkbox, Password } from '@keystonejs/fields';
import { GraphQLApp } from '@keystonejs/app-graphql';
import { AdminUIApp } from '@keystonejs/app-admin-ui';
const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const adapterConfig = { mongoUri: process.env.MONGO_URI };

const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  // onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
});

// Access control functions
const userIsAdmin = ({ authentication: { item: user } }) => Boolean(user && user.isAdmin);
const userOwnsItem = ({ authentication: { item: user } }) => {
  if (!user) {
    return false;
  }

  // Instead of a boolean, you can return a GraphQL query:
  // https://www.keystonejs.com/api/access-control#graphqlwhere
  return { id: user.id };
};

const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth);
  const isOwner = access.userOwnsItem(auth);
  return isAdmin ? isAdmin : isOwner;
};

const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner };

keystone.createList('User', {
  fields: {
    name: { type: Text },
    email: {
      type: Text,
      isUnique: true,
    },
    isAdmin: {
      type: Checkbox,
      // Field-level access controls
      // Here, we set more restrictive field access so a non-admin cannot make themselves admin.
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
    },
  },
  // List-level access controls
  access: {
    read: access.userIsAdminOrOwner,
    update: access.userIsAdminOrOwner,
    create: access.userIsAdmin,
    delete: access.userIsAdmin,
    auth: true,
  },
});

// ~

keystone.createList('Todo', {
  fields: {
    name: { type: Text },
    status: { type: Text, access: { read: true, create: true, update: true, delete: true } },
  },
});

//~

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: process.env.PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
