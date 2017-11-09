import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { columnTypeToString } from "./utilities";
const schemaIn = require('../schemas/dynamic.in.json');
const schemaOut = require('../schemas/push.out.json');

export async function getEntitySelectModel(cfg: ComponentConfig, cb: any) {
    const client = new APIClient(cfg);
    // console.log("getEntitySelectModel cfg", cfg);
    // TODO use the returned bool from fetch token to do error checking.
    await client.fetchToken();
    const result = await client.getEntities();
    // console.log("getEntitySelectModel result", result);
    cb(null, result);
    // return value exists for testability
    return result;
}

export async function parseEntity(cfg: ComponentConfig, cb: any) {
    // console.log("parseEntity config: ", cfg);
    const client = new APIClient(cfg);
    // console.log("parseEntity entitiyID: ", client.getEntityID());
    const isAuth = await client.fetchToken();
    // console.log("parseEntity auth", isAuth);
    let entity;
    if (isAuth) {
        // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4
        entity = await client.getEntity();
        // console.log("parseEntity colums", entity.Columns);
    }
    else {
        // If connection can't be established, pass empty object 
        cb(null, {});
    }

    // TODO factor out these definitons into seperate schema files, then import to modify.
    let metadata = { in: {}, out: {} };
    // TODO do this transform properly.
    const columns = entity.Columns;
    for (const index in columns) {
        let key = columns[index].Key;
        // TODO This needs to be refactored
        schemaIn.properties[key] = {
            "type": columnTypeToString(columns[index].ColumnType),
            "title": columns[index].Label
        };
    }

    metadata.in = schemaIn;
    metadata.out = schemaOut;
    // console.log("parseEntity metadata", metadata);
    cb(null, metadata);
    // This is for better testability
    return metadata;
}
