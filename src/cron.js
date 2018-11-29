"use strict";
const fetch = require("node-fetch");
module.exports.run = (event, context) => {
  const time = new Date();
  const body = {
    operationName: null,
    variables: {},
    query: "{events(limit: 1) {title}}"
  };
  console.log(`Your cron function "${context.functionName}" ran at ${time}`);
  fetch("https://31l4zbl2rd.execute-api.us-east-1.amazonaws.com/prod/graphql", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  })
    .then(res => res.json()) // expecting a json response
    .then(json => console.log(json));
};
