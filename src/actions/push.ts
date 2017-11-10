import { isUndefined } from "lodash";
import { ComponentConfig } from "../models/componentConfig";
import { APIClient } from "../apiclient";
import { getEntitySelectModel, parseEntity } from "../common";
const schemaOut = require('../../schemas/push.out.json');

exports.process = PushRows;
// This "redirect" behavior avoids code duplication
exports.getEntitySelectModel = getEntitySelectModel;
exports.getMetaModel = GetMetaModelPush;

/**
 * Insert new rows into a selected entity.
 *
 * @param msg incoming message
 * @param cfg object to retrieve configuration values
 * @param snapshot the scratchpad for persitence between execution runs
 *
 * @returns promise resolving a message to be emitted to the platform
 */
export async function PushRows(msg: elasticionode.Message, cfg: ComponentConfig, snapshot: any): Promise<any> {
  console.log("Msg body: ", msg);
  console.log("Snapshot", snapshot);
  // The msg.body should be exactly preformatted with JSONata.
  // and should always match what M2MGO backend expects in a PUT request
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

// This function can't be fully generic due to non dynamic output schema,
// only the dynamic input schema generation is reused inside parseEntity()
export async function GetMetaModelPush(cfg: ComponentConfig, cb: any) {
  // Declare an object to contain the input and output schemas
  let metadata = { in: {}, out: {} };
  // Output schema is static but Elastic.IO expects to find it in the dynamic
  // schema declaration object anyway. We simply imported it at the top and
  // packed it into the "out" property of the object
  metadata.out = schemaOut;
  // Dynamically populate input schema;
  metadata.in = await parseEntity(cfg);
  // console.log("parseEntity metadata", metadata);
  cb(null, metadata);
  // For easier testing
  return metadata;

}
