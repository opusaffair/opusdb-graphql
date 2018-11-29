import { neo4jgraphql } from "neo4j-graphql-js";

// Default to start search today and look 30 days ahead/back
const today = () => Math.round(new Date().getTime() / 1000);
const inAMonth = x => today() + (x || 1) * 30 * 24 * 60 * 60;
const aMonthAgo = x => today() - (x || 1) * 30 * 24 * 60 * 60;

const resolvers = {
  Query: {
    event(_, params, ctx) {
      let session = ctx.driver.session();
      let query = `
        MATCH (event:Event)
        WHERE event.slug CONTAINS $slug AND event.opus_id CONTAINS $opus_id
        RETURN event
        `;
      return session.run(query, params).then(result => {
        console.log(result);
        let results = result.records.map(record => {
          return record.get("event").properties;
        });
        return results[0];
      });
    },
    hello: () => `hello world`,
    events(_, params, ctx) {
      let session = ctx.driver.session();
      params.start = params.start || today();
      params.end = params.end || inAMonth();
      console.log(params);
      let query = `
        Match (v:Venue)
        WITH v,point({latitude: $lat, longitude: $lng}) as loc
        WHERE distance(loc,point({latitude:v.latitude, longitude: v.longitude})) < $radius
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
            MATCH (event:Event)-[r:INVOLVED_IN]-(user:User)
            WHERE event.opus_id = $opus_id
            // MATCH (event)-[r:INVOLVED_IN]-(user:User)
            RETURN distinct(user) as user
            SKIP $skip
            LIMIT $limit
          `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("user").properties;
        });
      });
    },
    orgs: (obj, params, ctx) => {
      let session = ctx.driver.session();
      params.opus_id = obj.opus_id;
      console.log(params);
      let query = `
            MATCH (event:Event)<-[r:ORGANIZES]-(org:Org)
            WHERE event.opus_id = $opus_id
            RETURN distinct(org) as org
          `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          return record.get("org").properties;
        });
      });
    },
    org_names: (obj, params, ctx) => {
      let session = ctx.driver.session();
      params.opus_id = obj.opus_id;
      let query = `
            MATCH (event:Event)<-[r:ORGANIZES]-(org:Org)
            WHERE event.opus_id = $opus_id
            RETURN distinct(org) as org
            ORDER BY org.name DESC
          `;
      return session.run(query, params).then(result => {
        let results = result.records.map(record => {
          return record.get("org").properties["name"];
        });
        results = results.join(", ").replace(/, ([^,]*)$/, " & $1");
        return results;
      });
    },
    venues: (obj, params, ctx) => {
      let session = ctx.driver.session();
      params.opus_id = obj.opus_id;
      let query = `
            Match (event:Event)-[r:HELD_AT]->(venue:Venue)
            WHERE event.opus_id = $opus_id
            RETURN distinct(venue) as venue
          `;
      return session.run(query, params).then(result => {
        return result.records.map(record => {
          let venue = record.get("venue").properties;
          return venue;
        });
      });
    }
  }
};

export default resolvers;
