import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { ColumnTypeToPrimitives } from "./models/columnTypeEnum";
const schemaIn = require('../schemas/dynamic.in.json');

// This function exists to fetch a list of entities from M2MGO backend for dropdown.
// callBack is a platform function that extracts the dropdown model object from the component.
export async function getEntitySelectModel(cfg: ComponentConfig, callBack: any) {
    // Generate a new Client because this function will be called in isolation.
    const client = new APIClient(cfg);

    let list = {};
    const payload = await client.getEntities();
    // if undefined return empty object
    if (!payload) {
        console.log("entity failed");
        return {};
    }
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

export async function getColumnSelectModel(cfg: ComponentConfig, callBack: any) {
    // Generate a new Client because this function will be called in isolation.
    const client = new APIClient(cfg);

    let list = {};
    let payload = await client.getEntity();
    // if undefined return empty object
    if (!payload) {
        console.log("column failed");
        return {};
    }
    payload = payload.Columns;
    for (const key in payload) {
        // These are the values to be selected (ID numbers)
        const ID = payload[key].ID;
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

    // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4
    // cfg object contains the ID hash and it is used internally by client.
    // TODO? should this data passing be externalised
    const entity = await client.getEntity();
    // if fetch failed, return empty object
    if (!entity) {
        return {};
    }
    // Add the entity information into the input schema.
    // Input object has a fixed field for search column name, don't break it here
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
