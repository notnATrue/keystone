const { Keystone } = require('@keystonejs/keystone');
const { PasswordAuthStrategy } = require('@keystonejs/auth-password');
const { Text, Checkbox, Password } = require('@keystonejs/fields');
const { GraphQLApp } = require('@keystonejs/app-graphql');
const { AdminUIApp } = require('@keystonejs/app-admin-ui');
const initialiseData = require('./initial-data');
const mongoose = require('mongoose');

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose');
const PROJECT_NAME = 'keystoneQl';
const adapterConfig = { mongoUri: 'mongodb://localhost/keystone-ql' };


const keystone = new Keystone({
  adapter: new Adapter(adapterConfig),
  onConnect: process.env.CREATE_TABLES !== 'true' && initialiseData,
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

// keystone.createList('Ticket',{
//    	autokey: { from: 'title', path: 'slug', unique: true },
//    });
   
//    Ticket.add({
//            title: { type: String, initial: true, default: '', required: true },  
//           description: { type: Types.Textarea },   
//           priority: { type: Types.Select, options: 'Low, Medium, High', default: '  Low' },
//           category: { type: Types.Select, options: 'Bug, Feature, Enhancement', default: 'Bug' },
//           status: { type: Types.Select, options: 'New, In Progress, Open, On Hold, Declined, Closed', default: 'New' },
//           createdBy: { type: Types.Relationship, ref: 'User', index: true, many: false },
//           assignedTo: { type: Types.Relationship, ref: 'User', index: true, many: false },
//           createdAt: { type: Datetime, default: Date.now },
//           updatedAt: { type: Datetime, default: Date.now }
//       });
  
//   Ticket.defaultSort = '-createdAt'; 
//  Ticket.register();

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
});

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      name: PROJECT_NAME,
      enableDefaultRoute: true,
      authStrategy,
    }),
  ],
};
