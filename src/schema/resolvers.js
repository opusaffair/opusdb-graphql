import { neo4jgraphql } from "neo4j-graphql-js";

// Default to start search today and look 30 days ahead/back
const today = () => Math.round(new Date().getTime() / 1000);
const inAMonth = x => today() + (x || 1) * 30 * 24 * 60 * 60;
const aMonthAgo = x => today() - (x || 1) * 30 * 24 * 60 * 60;

const resolvers = {
  Query: {
    hello: () => `hello world`,
    event: neo4jgraphql,
    events(_, params, ctx) {
      let session = ctx.driver.session();
      params.start = params.start || today();
      params.end = params.end || inAMonth();
      console.log(params);
      let query = `
        Match (v:Venue)
        WITH v,point({latitude: $lat, longitude: $lng}) as boston
        WHERE distance(boston,point({latitude:v.latitude, longitude: v.longitude})) < $radius
        MATCH (v)--(event:Event)
        WHERE event.end_datetime >= $start AND event.start_datetime <= $end
        AND event.title contains $title AND event.published = True
        RETURN event
        ORDER BY event.start_datetime ASC
        SKIP $skip
        LIMIT $limit`;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("event").properties;
        });
      });
    }
  },
  Event: {
    involved: (obj, params, ctx) => {
      let session = ctx.driver.session();
      params.opus_id = obj.opus_id;
      console.log(params);
      let query = `
            MATCH (event:Event)
            WHERE event.opus_id = $opus_id
            MATCH (event)-[r:INVOLVED_IN]-(user:User)
            RETURN user
            SKIP $skip
            LIMIT $limit
          `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("user").properties;
        });
      });
    }
  }
};

export default resolvers;
