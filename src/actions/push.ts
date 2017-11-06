import { isUndefined } from "lodash";

import { ComponentConfig } from "../models/componentConfig";
import { PipedriveMessage } from "../models/pipedriveMessage";

import { APIClient } from "../apiclient";

exports.process = pushRows;
exports.getEntities = getEntities;
exports.getMetaModel = parseEntity;

async function getEntities(cfg:ComponentConfig, cb:any) {
  const client = new APIClient(cfg);
  await client.fetchToken();
  const result = await client.getEntities();
  let list={};
  // Platform expects an object with id(value):label pairs we procude it here
  for (const key in result ){
    list[result[key].Identifier.ID]=result[key].Label;
  }
  cb(null, list);
}

async function parseEntity(cfg:ComponentConfig, cb:any){

  const client = new APIClient(cfg);
  const template = await client.getEntity();
  // TODO do this transform properly.
  const metadata = template;
  cb(null, metadata);

// https://pst.m2mgo.com/api/prototypeentities/types/f711d8e2-4814-4eb1-bb0c-5ef330fadda4

}

/**
 * createOrganisation creates a new org.
 *
 * @param data incoming messages which is empty for triggers
 * @param cfg object to retrieve triggers configuration values
 * @param snapshot the scratchpad for persitence between execution runs
 *
 * @returns promise resolving a message to be emitted to the platform
 */
export async function pushRows(msg: elasticionode.Message, cfg: ComponentConfig, snapshot: any): Promise<any> {
    console.log("Msg content:");
    console.log(msg);
    console.log("Cfg content:");
    console.log(cfg);
    console.log("snapshot content:");
    console.log(snapshot);

    let data = <PipedriveMessage>msg.body;

    // Generate the config for https request
    if (isUndefined(cfg)) {
        throw new Error("cfg is undefined");
    }

    // Client init
    const client = new APIClient(cfg);
    return client.insertRow(data);
}
