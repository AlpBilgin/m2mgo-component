import { isUndefined } from "lodash";

import { ComponentConfig } from "../models/componentConfig";
import { PipedriveMessage } from "../models/pipedriveMessage";

import { APIClient } from "../apiclient";
import { getEntitySelectModel, parseEntity } from "../common";

exports.process = pushRows;
// This "redirect" behavior avoids code duplication
exports.getEntitySelectModel = getEntitySelectModel;
exports.getMetaModel = parseEntity;


/**
 * Insert new rows into a selected entity.
 *
 * @param msg incoming message
 * @param cfg object to retrieve configuration values
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
