import { checkAndImport } from "./actions/push.test";
import { ComponentConfig } from "../src/models/componentConfig";
import { APIClient } from "../src/apiclient";

const testConfig = checkAndImport("../../testconfig");

let cfg = { email: "", password: "", M2MGO_Entity: "" } as ComponentConfig;

// TODO Contact M2MGO and get a list of response codes for the entire API surface for http mocking
// TODO OR maybe contact them and ask for a dummy API surface like Elastic.io has?
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
            cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: "f711d8e2-4814-4eb1-bb0c-5ef330fadda4" } as ComponentConfig : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: "" } as ComponentConfig;
            const client = new APIClient(cfg);
            const payload = {
                Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
                    {
                        ColumnKey: "cccKey",              //key value of column we want to filter
                        Comparer: 4,   // the filter type 4 is simpl equal
                        ColumnValue: 1      //the filter value
                    }
                ],
                PageSize: 10,    //how many results you want to have back (by default 10)
                TimezoneOffset: 0   //Slice by timestamp, would be modified by 
            };
            const data = await client.searchRow(payload);
            // should be an array, could be empty, not very important ATM.
            expect(data.Model).toBeInstanceOf(Array);
        });
    });
} else {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
}