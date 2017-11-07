import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";
import { columnTypeToString } from "./utilities";

export class InputField {
    constructor(public type: string,
        public title: string) { }
}

export async function getEntitySelectModel(cfg: ComponentConfig, cb: any) {
    const client = new APIClient(cfg);
    await client.fetchToken();
    const result = await client.getEntities();
    // console.log(result);
    cb(null, result);
    // return value exists for testability
    return result;
}

export async function parseEntity(cfg: ComponentConfig, cb: any) {

    const client = new APIClient(cfg);
    const isAuth = await client.fetchToken();
    let entity;
    if (isAuth) {
        // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4
        entity = await client.getEntity();
    }
    else {
        // If connection can't be established, pass empty object 
        cb(null, {});
    }

    let metadata = { in: {}, out: {} };
    let inHolder = {};
    let outHolder = {};
    // console.log(holder.Columns);
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
    cb(null, metadata);
    // This is for better testability
    return metadata;
}
