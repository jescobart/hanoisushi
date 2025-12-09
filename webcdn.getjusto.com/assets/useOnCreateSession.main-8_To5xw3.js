import{z as e}from"./apollo-hooks.es-DZ97-Of4.js";import{a as o}from"./index-BHERncwe.js";import{g as s}from"./gql-CqV_3job.js";import{c as n}from"./index-Dg1ijqza.js";function p(){const r=e();return async t=>{try{await r({clientName:n.main,mutation:s(`mutation onCreateSessionAuthLogin($userId: ID) {
          onCreateSession(userId: $userId)
        }`),variables:{userId:t}})}catch(a){o(a)}}}export{p as u};
