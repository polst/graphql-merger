# graphql-merger
Merge definitions of GraphQL scheme found in given folder

NOTES: 
* Written with ES6+. Tested with Babel and Node 6.9.2 
* Not published to npm repo.
* MIT
* Suggestions are welcome
* Inspiration taken from many places

##Usage

####`import graphqlModulesMerger from '../utils/graphqlMerger';`

Merges graphql modules without adding
 
```
    schema {
      query: Query
      mutation: Mutation
    }
```

Good for creating GraphQL packages to be used later.

####`import {graphqlMerger} from '../utils/graphqlMerger';`

Merges graphql modules adding at the end 

```graphql schema
    schema {
      query: Query
      mutation: Mutation
    }
```

Good for delivery of the schema.

###Returns

`{Schema, Subcriptions}`

##Schema defs

Schema must be defined this way:
 
!!!ATTN!!!: notice `extend` keyword on `Query` and `Mutation`

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
    }
  }
})();

export { typeDefs, resolvers }
```

NOTE: also, you can include in the returned object the subscriptions 
