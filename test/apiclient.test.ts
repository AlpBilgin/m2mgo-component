import { checkAndImport } from "./actions/push.test";
import { ComponentConfig } from "../src/models/componentConfig";
import { APIClient, ComparisonOperators, } from "../src/apiclient";

const testConfig = checkAndImport("../../testconfig");


/**
 * API Client tests are designed to target a live test table in the M2MGO backend.
 * The table is expected to have a unique numeric PK column and a boolean column.
 */

// TODO Contact M2MGO and get a list of response codes for the entire API surface for http mocking
// TODO OR maybe contact them and ask for a dummy API surface like Elastic.io has?
// TODO put client creation into a before each.
// TODO testing requires at least one numeric PK column and one boolean column in the test table
if (testConfig || (process.env.EMAIL && process.env.PASSWORD && process.env.M2MGO_ENTITY && process.env.ENTITY_KEY)) {

    const cfgInvalid = { email: "", password: "", M2MGO_Entity: "", Entity_key: "" } as ComponentConfig;
    const cfgValid = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: testConfig.TestConfig.M2MGO_Entity, Entity_key: testConfig.TestConfig.Entity_key } as ComponentConfig
        : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: process.env.M2MGO_ENTITY, Entity_key: process.env.ENTITY_KEY } as ComponentConfig;
    const payload = {
        Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
            {
                ColumnKey: cfgValid.Entity_key,              //name of the column to search
                Comparer: ComparisonOperators.Equals,   // comparison operator for search (==)
                ColumnValue: testConfig.TestConfig.DummyPayload[cfgValid.Entity_key]      //the filter value, the dummypayload object should have a property that has the same as the column to be searched 
            }
        ],
        PageSize: 10,    //how many results you want to have back (by default 10)
        TimezoneOffset: 0   //Slice by timestamp, would be modified by 
    };

    describe("Api client unit sized integration tests", () => {

        it("will request entity with bad token, bad creds", async () => {
            const client = new APIClient(cfgInvalid);
            const data = await client.getEntities();
            expect(data).toBeUndefined();
        });

        it("will request a single entity definition with bad token, good creds", async () => {
            const client = new APIClient(cfgValid);
            const data = await client.getEntity();
            expect(data).toBeDefined();
        });

        it("will request entity list with bad token, good creds", async () => {
            const client = new APIClient(cfgValid);
            const data = await client.getEntities();
            expect(data).toBeDefined();
        });

        it("will conduct a search, insert dummy if nothing is found", async () => {
            const client = new APIClient(cfgValid);
            const data = await client.searchRow(payload);
            // should be an array, could be empty, not very important at the moment.
            expect(data.Model).toBeInstanceOf(Array);
            // If result set is empty
            if (data.Model.length === 0) {
                const insertPayload = { Values: testConfig.TestConfig.DummyPayload };
                expect(await client.insertRow(insertPayload)).toBeTruthy();
            }
        });

        it("will conduct a search, if at least one entity is found will update the first boolean value of the entity, will search again to compare", async () => {
            const client = new APIClient(cfgValid);
            const data = await client.searchRow(payload);
            // should be an array, could be empty, not very important at the moment.
            expect(data.Model).toBeInstanceOf(Array);
            // If something is found
            if (data.Model[0]) {
                // Parse returned data into meaningful update request parameters
                // console.log(data.Model[0]);
                const rowId = data.Model[0].Identifier.ID;
                // This is a shallow copy: all operations will affect data.Model[0]
                // console.log(rowId);
                let update = data.Model[0];
                // Remove cruft
                delete update.Identifier;
                delete update.EntityTypeIdentifier;
                // Look for a boolean and flip the value
                // Create a copy of modified property name and initial state
                let referenceKey;
                let referenceVal;
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
            }
        });
    });
} else {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
}