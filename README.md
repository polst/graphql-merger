# graphql-merger
Merge definitions of GraphQL scheme found in given folder

NOTES: 
* Written with ES6. Tested with Babel and Node 6.9.2 
* Not published to npm repo.
* MIT
* Suggestions are welcome
* Inspiration taken from many places

##Usage

####`import graphqlModulesMerger from '../utils/graphqlMerger';`

Not tested. Probably not working, but used by next one.

Merges graphql modules without adding `type Query`, `type Mutation`, `type Subscription` and `schema`.

Good for creating GraphQL packages to be used later.

####`import {graphqlMerger} from '../utils/graphqlMerger';`

Delivers final version of the schema

###Returns

`{Schema, SetupFunctions}`

##Schema defs

Scheme are defined in file names which contains `graphql`, like `todos.graphql.js`

Schema must be defined this way:
 
!!!ATTN!!!: notice `extend` keyword on `Query`, `Subscription` and `Mutation`

```
// language="GraphQL Schema"
const typeDefs = `
  # the Todo type with an id and a text 
  type Todo {
    id: Int                     
    text: String
  }
  extend type Query {
    # Find a Todo with id
    todo(id: Int): Todo         
    # Find All todos
    todos: [Todo]               
  }
  extend type Mutation {
    # Add a new Todo with a content text
    addTodo(text: String): Boolean
    # Delete a todo with id
    deleteTodo(id: Int): Boolean
  } 
  extend type Subscription {
    # When new todo is added
    todoAdded(text: String): Todo
  }
`;

const resolvers = (() => {
  let todos = [];

  const genId = (_ => {
    let id = 0;
    return _ => ++id;
  })();

  return {
    Query: {
      todo:     (_, { id }) => todos.find(todo => todo.id === id),
      todos:              _ => todos
    },
    Mutation: {
      addTodo:  (_, {text}) => (todos.push({id: genId(), text}), true),
      deleteTodo: (_, {id}) => (todos = todos.filter(todo => todo.id !== id), true)
    },
    Subscription: {
      todoAdded(todo) {
        return "todo was here!";
      },
    }
  }
})();

const setupFunctions = {
  todoAdded: (options, args) => ({
    newCommentsChannel: {
      filter: todo => todo.text === '',
    },
  })
};

export { typeDefs, resolvers, setupFunctions }
```
