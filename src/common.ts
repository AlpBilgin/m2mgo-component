import { APIClient } from "./apiclient";
import { ComponentConfig } from "./models/componentConfig";



export async function getEntities(cfg: ComponentConfig, cb: any) {
    const client = new APIClient(cfg);
    await client.fetchToken();
    const result = await client.getEntities();
    let list = {};
    // Platform expects an object with id(value):label pairs we procude it here
    for (const key in result) {
        list[result[key].Identifier.ID] = result[key].Label;
    }
    cb(null, list);
}

export async function parseEntity(cfg: ComponentConfig, cb: any) {

    const client = new APIClient(cfg);
    const template = await client.getEntity();
    // TODO do this transform properly.
    const metadata = template;
    cb(null, metadata);

    // https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4

}
