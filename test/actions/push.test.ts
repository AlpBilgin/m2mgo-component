import { GetMetaModelPush, PushRows } from "../../src/actions/push";
import { getEntitySelectModel, getColumnSelectModel } from "../../src/common";
import { ComponentConfig } from "../../src/models/componentConfig";

export function checkAndImport(path: string): any {
    try {
        return require(path);
    } catch (error) {
        return undefined;
    }
}

var testConfig = checkAndImport("../../testconfig");

function consoleDumpCallback(first, second) {
    expect(first).toBeNull();
    expect(second).toBeDefined();
}

// If environment variables aren't declared, ignore the test
if (testConfig || (process.env.EMAIL && process.env.PASSWORD && process.env.M2MGO_ENTITY)) {
    describe("should perform unit sized interation tests for push action", async () => {
        // Either TestConfig or env has the necessary info.
        let cfg = testConfig ? { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: testConfig.TestConfig.M2MGO_Entity, Entity_key: testConfig.TestConfig.Entity_key } as ComponentConfig
            : { email: process.env.EMAIL, password: process.env.PASSWORD, M2MGO_Entity: process.env.M2MGO_ENTITY, Entity_key: process.env.ENTITY_KEY } as ComponentConfig;

        it("should fetch a list of table metadata", async () => {
            let result = await getEntitySelectModel(cfg, consoleDumpCallback);
            // console.log("tbl result", result);
            const listOfKeys = Object.keys(result);
            // Test first result id against a regex
            expect(listOfKeys[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it("should fetch a list of table column metadata", async () => {
            let result = await getColumnSelectModel(cfg, consoleDumpCallback);
            // console.log("col result", result);
            const listOfKeys = Object.keys(result);
            // Test first result id against a regex
            expect(listOfKeys[0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        });

        it("should get the metadata of the given table", async () => {
            let model = await GetMetaModelPush(cfg, consoleDumpCallback);
            // check validity by duck typing
            expect(model.in).toBeDefined();
            expect(model.out).toBeDefined();
        });

        it("should attempt to insert (or update) data into the given table", async () => {
            const payload = testConfig.TestConfig.DummyPayload;
            const msg = { body: payload };
            expect(await PushRows(msg, cfg, {})).toBeTruthy();
        });

    });
} else {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
}


