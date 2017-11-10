import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { ColumnTypeToPrimitives } from "./models/columnTypeEnum";
const schemaIn = require('../schemas/dynamic.in.json');

// This function exists to fetch a list of entities from M2MGO backend for dropdown.
// callBack is a platform function that extracts the dropdown model object from the component.
export async function getEntitySelectModel(cfg: ComponentConfig, callBack: any) {
    // Generate a new Client because this function will be called in isolation.
    const client = new APIClient(cfg);
    // TODO use the returned bool from fetch token to do error checking.
    // Login the client instance
    await client.fetchToken();
    let list = {};
    const payload = await client.getEntities();
    for (const key in payload) {
        // These are the values to be selected (ID numbers)
        const ID = payload[key].Identifier.ID;
        // These values will be visible in the dropdown as labels(Human readable table names)
        const Label = payload[key].Label;
        // These key-value pairs will be used to populate the dropdown.
        list[ID] = Label;
    }
    // console.log("getEntitySelectModel result", result); 
    callBack(null, list);
    // return value exists for testability
    return list;
}

// This function exists to dynamically produce input output schemas
export async function parseEntity(cfg: ComponentConfig) {
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
        // TODO? should this data passing be externalised
        entity = await client.getEntity();
        // console.log("parseEntity colums", entity.Columns);
    }
    else {
        // If connection can't be established, pass empty object
        // TODO ask elastic.IO about how to handle this better
        return {};
    }
    // Format the entity information into an input schema
    // TODO improve this transformation
    const columns = entity.Columns;
    for (const index in columns) {
        let key = columns[index].Key;
        schemaIn.properties[key] = {
            "type": ColumnTypeToPrimitives(columns[index].ColumnType),
            "title": columns[index].Label
        };
    }
    // Return input schema to be used by a getmetamodel function
    return schemaIn;
}
