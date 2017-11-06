import {APIClient }from "../src/apiclient";
import {ComponentConfig} from "../src/models/componentConfig";



// If environment variables can't be passed to node, create a .env file in root
// and define EMAIL=XXXX and PASSWORD=YYYY inside
if (!(process.env.EMAIL && process.env.PASSWORD)){
   console.log("Test will attempt to pull variables from .env file")
   require('dotenv').config();
}

let cfg = {Email:process.env.EMAIL, Password:process.env.PASSWORD, M2MGO_Entity:""} as ComponentConfig

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
    api.setEntityID(Object.keys(await api.getEntities())[0]);
    // Check to see if the returned hash matches the expected 8-4-4-4-12 format
    expect(api.getEntityID()).toMatch(/[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/);


// this is the dynamic metadata function
  const holder = await api.getEntity();
  let metadata = {in:null, out:null};
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

  metadata.in=inHolder;
  metadata.out=outHolder;

  // Check if all items have a title
  for(const key in metadata.in ){
    expect(metadata.in[key].title).toBeDefined();
  }

}


it("should run tester", tester);
