import { isUndefined } from "lodash";
import { ComponentConfig } from "../models/componentConfig";
import { APIClient, ComparisonOperators } from "../apiclient";
import { getEntitySelectModel, getColumnSelectModel, parseEntity } from "../common";
const schemaOut = require('../../schemas/push.out.json');

exports.process = PushRows;
// This "redirect" behavior avoids code duplication
exports.getEntitySelectModel = getEntitySelectModel;
exports.getColumnSelectModel = getColumnSelectModel;
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
  // Save primary key literal
  const primaryKey = cfg.Entity_key;
  // The msg.body should be exactly preformatted with JSONata.
  // and should always match what M2MGO backend expects in a PUT request
  const data = { Values: msg.body };

  // Check if config came in properly
  if (isUndefined(cfg)) {
    throw new Error("cfg is undefined");
  }

  // Client init
  const client = new APIClient(cfg);
  // Check if primary key is already defined
  const search = {
    Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
      {
        ColumnKey: primaryKey,              //key value of column we want to filter
        Comparer: ComparisonOperators.Equals,   // we want to find exact match
        ColumnValue: msg.body[primaryKey]      //TODO this assumes the filter value
      }
    ],
    PageSize: 2,    //how many results you want to have back default is 10 but 2 is enough to see if something is weird
    TimezoneOffset: 0   //Slice by timestamp, would be modified by 
  };
  const found = await client.searchRow(search);
  console.log(found.Model.length);
  try {
    if (found.Model.length === 1) {
      // Update
      await client.updateRow(data, found.Model[0].Identifier.ID);
    } else if (found.Model.length === 0) {
      // Push as new data
      await client.insertRow(data);
    } else {
      return { result: false };
    }
  } catch (error) {
    console.log(error);
    return { result: false };
  }
  // Return boolean.
  return { result: true };
}

// This function can't be fully generic due to non dynamic output schema,
// only the dynamic input schema generation is reused inside parseEntity()
// callBack is a platform function that extracts metadata object from the component.
export async function GetMetaModelPush(cfg: ComponentConfig, callBack: any) {
  // Declare an object to contain the input and output schemas
  let metadata = { in: {}, out: {} };
  // Output schema is static but Elastic.IO expects to find it in the dynamic
  // schema declaration object anyway. We simply imported it at the top and
  // packed it into the "out" property of the object
  metadata.out = schemaOut;
  // Dynamically populate input schema;
  metadata.in = await parseEntity(cfg);
  // console.log("parseEntity metadata", metadata);
  callBack(null, metadata);
  // For easier testing
  return metadata;

}
