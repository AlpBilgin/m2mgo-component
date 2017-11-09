import { pushRows } from "../../src/actions/push";
import { getEntitySelectModel, parseEntity } from "../../src/common";
import { ComponentConfig } from "../../src/models/componentConfig";
import { columnTypeToString } from '../../src/utilities';

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

async function tester() {

    let cfg = { email: testConfig.TestConfig.Email, password: testConfig.TestConfig.Password, M2MGO_Entity: "" } as ComponentConfig;

    let result = await getEntitySelectModel(cfg, consoleDumpCallback);
    // console.log("dropdown selection", Object.keys(result)[0]);
    // This bit simulates the act of selecting a entity in dropdown, after which key is passed to config
    cfg.M2MGO_Entity = Object.keys(result)[0];
    let model = await parseEntity(cfg, consoleDumpCallback);
    // console.log("input model", model);
    const columns = model.in["properties"];
    // Replace column definitions with appropriate literals
    for (const index in columns) {
        let val: any;
        // console.log(columns[index]);
        switch (columns[index].type) {
            case 'number':
                columns[index] = 1;
                break;
            case 'boolean':
                columns[index] = true;
                break;
            case 'string':
                columns[index] = "a";
                break;
            default:
                columns[index] = "1";
                break;
        }
    }
    // console.log(columns);
    const payload = { Values: columns };
    const msg = { body: payload };
    expect(await pushRows(msg, cfg, {})).toBeTruthy();
}

// If environment variables aren't declared, ignore the test
if (!testConfig) {
    it("will ignore integration tests", () => {
        console.log("ignored");
        expect(true).toBe(true);
    });
} else {
    it("should non-deterministically select a table and insert placeholder data", tester);
}


