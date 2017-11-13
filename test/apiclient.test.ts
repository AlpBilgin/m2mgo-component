import { checkAndImport } from "./actions/push.test";
import { ComponentConfig } from "../src/models/componentConfig";
import { APIClient } from "../src/apiclient";

const testConfig = checkAndImport("../../testconfig");

let cfg = { email: "", password: "", M2MGO_Entity: "" } as ComponentConfig;

// TODO Contact M2MGO and get a list of response codes for the entire API surface for http mocking
// TODO OR maybe contact them and ask for a dummy API surface like Elastic.io has?
if (testConfig || (process.env.EMAIL && process.env.PASSWORD)) {
    describe("Api client unit sized integration tests", () => {
        it("will attempt false login", async () => {
            const client = new APIClient(cfg);
            expect(await client.fetchToken()).toBeFalsy();
        });

        it("will request entity with bad token, bad creds", async () => {
            const client = new APIClient(cfg);
            expect(await client.getEntities()).toBeUndefined();
        });

        it("will request entity with bad token, good creds", async () => {
            cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: "" } as ComponentConfig : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: "" } as ComponentConfig;
            const client = new APIClient(cfg);
            expect(await client.getEntities()).toBeDefined();
        });
    });
} else {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
}