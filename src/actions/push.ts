import { isUndefined } from "lodash";
import { ComponentConfig } from "../models/componentConfig";
import { APIClient } from "../apiclient";
import { getEntitySelectModel, parseEntity } from "../common";

exports.process = pushRows;
// This "redirect" behavior avoids code duplication
// TODO The problem may be that getMetaModel is not the same for all actions/triggers
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
  console.log("Msg body: ", msg);
  console.log("Snapshot", snapshot);
  // The msg.body should be exactly preformatted with JSONata.
  // TODO this object should always match what M2MGO backend expects in PUT
  const data = { Values: msg.body };

  // Check if config came in properly
  if (isUndefined(cfg)) {
    throw new Error("cfg is undefined");
  }

  // Client init
  const client = new APIClient(cfg);
  // Login the client instance
  await client.fetchToken();
  // Push data into M2MGO
  const resp = await client.insertRow(data);
  // Return boolean.
  return { result: resp };
}
