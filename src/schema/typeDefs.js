import { gql } from "apollo-server-express";

// Set defaults for Boston
const lat = 42.3601,
  lng = -71.058,
  radius = 5000;

const typeDefs = gql`

  type User {
    opus_id: ID!
    username: String!
    name_full: String
  }

  type Tag {
    opus_id: ID!
    name: String
    slug: String!
    eventsUpcoming(
      limit: Int = 12,
      skip: Int = 0,
      start: Float,
      end: Float,
      lat: Float = ${lat},
      lng: Float = ${lng},
      radius: Float = ${radius}
    ): [Event]
  }

  type Org {
    opus_id: ID!
    name: String!
    slug: String!
  }

  type Event {
    opus_id: ID!
    title: String
    slug: String!
    organizer_desc: String
    opus_desc: String
    created_at: String
    updated_at: String
    start_datetime: String
    end_datetime: String
    timezone: String
    ticket_link: String
    button_text: String
    has_offer: Boolean
    image_path: String
    image_url: String
    last_modified: String
    offer_desc: String
    offer_expiration: String
    opus_event: Boolean
    price_desc: String
    published: Boolean
    rsvp_only: Boolean
    view_count: String
    pagerank: Float
    orgs: [Org]
    # degree: Int @cypher(statement: "RETURN SIZE((this)-->())")
    involved (skip: Int = 0, limit: Int = 10): [User]
  }

  type Query {
    hello: String
    events(
      title: String = "",
      limit: Int = 12,
      skip: Int = 0,
      start: Float,
      end: Float,
      lat: Float = ${lat},
      lng: Float = ${lng},
      radius: Float = ${radius}
    ): [Event]
    event(opus_id: ID, title: String, slug: String): Event
  }
`;

export default typeDefs;
