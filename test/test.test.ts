import {APIClient }from "../src/apiclient";
import {ComponentConfig} from "../src/models/componentConfig";


// If environment variables can't be declared, create a testConfig.ts file and
// locally declare cfg object in root folder
let cfg:ComponentConfig
if (process.env.EMAIL && process.env.PASSWORD){
   cfg = {Email:process.env.EMAIL, Password:process.env.PASSWORD, M2MGO_Entity:""} as ComponentConfig
} else {
   cfg = require("../testConfig").cfg;
}

// console.log(cfg);

const api = new APIClient(cfg);

class InputField{
  constructor(public type:string,
              public required: boolean,
              public title:string){}
}

async function tester(){
  // Common Login
  await api.fetchToken();

// the act of selecting a table from the dropdown
    api.entitiyID=Object.keys(await api.getEntities())[0];
    // Check to see if the returned hash matches the expected 8-4-4-4-12 format
    expect(api.entitiyID).toMatch(/[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/);


// this is the dynamic metadata function
  const holder = await api.getEntity();
  let metadata = {};
  let inHolder = {};
  let outHolder = {};
   // console.log(holder.Columns);
  const columns = holder.Columns;
  for (const index in columns){
    let key = columns[index].Key;
    inHolder[key]=new InputField(
      columns[index].ColumnType,
      true,
      columns[index].Label
    )
  }

  metadata["in"]=inHolder;
  metadata["out"]=outHolder;

  // Check if all items have a title
  for(const key in metadata.in ){
    expect(metadata.in[key].title).toBeDefined();
  }

}


it("should run tester", tester);
