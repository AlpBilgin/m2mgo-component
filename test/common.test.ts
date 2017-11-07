import { APIClient } from "../src/apiclient";
import { ComponentConfig } from "../src/models/componentConfig";
import { getEntitySelectModel, parseEntity } from "../src/common";

export function checkAndImport(path: string): any {
  try {
    return require(path);
  } catch (error) {
    return undefined;
  }
}

var testConfig = checkAndImport("../testconfig").TestConfig;

function consoleDumpCallback(first, second, third?) {
  expect(first).toBeNull();
  expect(second).toBeDefined();
}

async function tester() {

  let cfg = { Email: testConfig.Email, Password: testConfig.Password, M2MGO_Entity: "" } as ComponentConfig;

  let result = await getEntitySelectModel(cfg, consoleDumpCallback);
  // console.log("dropdown selection", Object.keys(result)[0]);
  // This bit simulates the act of selecting a entity in dropdown, after which key is passed to config
  cfg.M2MGO_Entity = Object.keys(result)[0];
  let model = await parseEntity(cfg, consoleDumpCallback);
  // console.log("input model", model);
}

// If environment variables aren't declared, ignore the test
if (!testConfig) {
  it("will ignore integration tests", () => {
    // console.log("ignored");
    expect(true).toBe(true);
  });
} else {
  it("should run tester", tester);
}


