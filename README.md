# graphql-middleware-prometheus

> GraphQL Middleware plugin for Prometheus.

## Usage

> With GraphQL Yoga

```ts
import { GraphQLServer } from 'graphql-yoga'
import { 
  prometheus,
  serverPrometheus 
} from "graphql-prometheus-middleware";

const typeDefs = `
  type Query {
    hello: String!
    bug: String!
  }
`

const resolvers = {
  Query: {
    hello: () => `Hey there!`
    bug: () => {
      throw new Error(`Many bugs!`)
    }
  }
}

const prometheusMiddleware = prometheus({})

const server = GraphQLServer({
  typeDefs,
  resolvers,
  middlewares: [prometheusMiddleware]
})
serverPrometheus(server)
server.start(() => `Server running on http://localhost:4000`)
```
