import { checkAndImport } from "./actions/push.test";
import { ComponentConfig } from "../src/models/componentConfig";
import { APIClient, ComparisonOperators } from "../src/apiclient";

const testConfig = checkAndImport("../../testconfig");

let cfg = { email: "", password: "", M2MGO_Entity: "" } as ComponentConfig;

// TODO Contact M2MGO and get a list of response codes for the entire API surface for http mocking
// TODO OR maybe contact them and ask for a dummy API surface like Elastic.io has?
// TODO turn search object into a class ot interface.
if (testConfig || (process.env.EMAIL && process.env.PASSWORD)) {
    describe("Api client unit sized integration tests", () => {

        it("will request entity with bad token, bad creds", async () => {
            const client = new APIClient(cfg);
            const data = await client.getEntities();
            expect(data).toBeUndefined();
        });

        it("will request entity with bad token, good creds", async () => {
            cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: "" } as ComponentConfig : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: "" } as ComponentConfig;
            const client = new APIClient(cfg);
            const data = await client.getEntities();
            expect(data).toBeDefined();
        });

        it("will conduct a search", async () => {
            cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: testConfig.TestConfig.M2MGO_Entity } as ComponentConfig : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: process.env.M2MGO_ENTITY } as ComponentConfig;
            const client = new APIClient(cfg);
            const payload = {
                Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
                    {
                        ColumnKey: "cccKey",              //key value of column we want to filter
                        Comparer: ComparisonOperators.Equals,   // we want to find exact match
                        ColumnValue: 1      //the filter value
                    }
                ],
                PageSize: 10,    //how many results you want to have back (by default 10)
                TimezoneOffset: 0   //Slice by timestamp, would be modified by 
            };
            const data = await client.searchRow(payload);
            // should be an array, could be empty, not very important at the moment.
            expect(data.Model).toBeInstanceOf(Array);
        });

        it("will conduct a search, will update if an entity is found, will search again to compare", async () => {
            cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: testConfig.TestConfig.M2MGO_Entity } as ComponentConfig : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: process.env.M2MGO_ENTITY } as ComponentConfig;
            const client = new APIClient(cfg);
            const payload = {
                Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
                    {
                        ColumnKey: "cccKey",              //key value of column we want to filter
                        Comparer: ComparisonOperators.Equals,   // we want to find exact match
                        ColumnValue: 1      //TODO this assumes the filter value
                    }
                ],
                PageSize: 10,    //how many results you want to have back (by default 10)
                TimezoneOffset: 0   //Slice by timestamp, would be modified by 
            };
            const data = await client.searchRow(payload);
            // Parse returned data into meaningful update request parameters
            // console.log(data.Model[0]);
            const rowId = data.Model[0].Identifier.ID;
            // This is a shallow copy all operations will affect data.Model[0]
            // console.log(rowId);
            let update = data.Model[0];
            // Remove cruft
            delete update.Identifier;
            delete update.EntityTypeIdentifier;
            // Create reference value to save initial state
            let referenceKey;
            let referenceVal;
            // Look for a boolean and flip the value
            for (let i in update) {
                if (typeof update[i] === "boolean") {
                    // flip the boolean
                    referenceKey = i;
                    referenceVal = update[i];
                    update[i] = !update[i];
                    break;
                }
            }
            // repack into a parent object to achieve expected payload format.
            update = { Values: update };
            // console.log(update);
            // Use modified data to update the database.
            const resp = await client.updateRow(update, rowId);
            //Expect a 200 status
            expect(resp.status).toBe(200);
            //search again
            const data2 = await client.searchRow(payload);
            // Check if returned value is really the inverse of updated value
            expect(data2.Model[0][referenceKey]).toBe(!referenceVal);
        });
    });
} else {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
}