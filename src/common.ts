import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { columnTypeToString } from "./utilities";
const schemaIn = require('../schemas/dynamic.in.json');
const schemaOut = require('../schemas/push.out.json');

// This function exists to fetch a list of entities from M2MGO backend for dropdown.
// TODO rename the variable cb to something more expressive
export async function getEntitySelectModel(cfg: ComponentConfig, cb: any) {
    // Generate a new Client because this function will be called in isolation.
    const client = new APIClient(cfg);
    // TODO use the returned bool from fetch token to do error checking.
    // Login the instance
    await client.fetchToken();
    let list = {};
    const payload = await client.getEntities();
    for (const key in payload) {
        const ID = payload[key].Identifier.ID;
        const Label = payload[key].Label;
        list[ID] = Label;
    }
    // console.log("getEntitySelectModel result", result); 
    cb(null, list);
    // return value exists for testability
    return list;
}

// This function exists to dynamically produce input output schemas
export async function parseEntity(cfg: ComponentConfig, cb: any) {
    // console.log("parseEntity config: ", cfg);
    // Generate a new Client because this function will be called in isolation.
    const client = new APIClient(cfg);
    // console.log("parseEntity entitiyID: ", client.getEntityID());
    // login the instance
    const isAuth = await client.fetchToken();
    // console.log("parseEntity auth", isAuth);
    let entity;
    if (isAuth) {
        // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4
        // cfg object contains the ID hash and it is used internally by client.
        // TODO? should this data passing be externalised?
        entity = await client.getEntity();
        // console.log("parseEntity colums", entity.Columns);
    }
    else {
        // If connection can't be established, pass empty object 
        // TODO ask elastic.IO about how to handle this better
        cb(null, {});
    }

    // Declare an object to contain the input and output schemas
    let metadata = { in: {}, out: {} };
    // Format the entity information into an input schema
    // TODO improve this transformation
    const columns = entity.Columns;
    for (const index in columns) {
        let key = columns[index].Key;
        schemaIn.properties[key] = {
            "type": columnTypeToString(columns[index].ColumnType),
            "title": columns[index].Label
        };
    }

    metadata.in = schemaIn;
    // Output is currently static but Elastic.IO expects to see it in the "dynamic" object anyway.
    // We have simply imported it at the top and packed it into the "out" property.
    metadata.out = schemaOut;
    // console.log("parseEntity metadata", metadata);
    cb(null, metadata);
    // This is for better testability
    return metadata;
}
