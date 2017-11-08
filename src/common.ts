import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { columnTypeToString } from "./utilities";

export class InputField {
    constructor(public type: string,
        public title: string) { }
}

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
    console.log("parseEntity auth", isAuth);
    let entity;
    if (isAuth) {
        // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4
        entity = await client.getEntity();
        console.log("parseEntity colums", entity.Columns);
    }
    else {
        // If connection can't be established, pass empty object 
        cb(null, {});
    }

    let metadata = { in: {}, out: {} };
    let inHolder = {};
    let outHolder = {};
    // TODO do this transform properly.
    const columns = entity.Columns;
    for (const index in columns) {
        let key = columns[index].Key;
        // TODO This needs to be refactored
        inHolder[key] = new InputField(
            columnTypeToString(columns[index].ColumnType),
            columns[index].Label
        );
    }

    metadata.in = inHolder;
    metadata.out = outHolder;
    console.log("parseEntity metadata", metadata);
    cb(null, metadata);
    // This is for better testability
    return metadata;
}
