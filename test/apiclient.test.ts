import { APIClient } from "../src/apiclient";
import { ComponentConfig } from "../src/models/componentConfig";
import { InputField } from "../src/common";
import { checkAndImport } from "./common.test";

var testConfig = checkAndImport("../testconfig");

// If environment variables aren't declared, ignore the test
if (!testConfig) {
  it("will ignore integration tests", () => {
    expect(true).toBe(true);
  });
} else {
  it("should run several successful API client calls", async () => {

    let cfg = { Email: testConfig.TestConfig.Email, Password: testConfig.TestConfig.Password, M2MGO_Entity: "" } as ComponentConfig;

    const api = new APIClient(cfg);
    // test Login
    expect(await api.fetchToken()).toBeTruthy();

    // Procure a list of entities for dropdown list
    const entities = await api.getEntities();
    expect(entities).toBeDefined();

    // Select first entity ID and feed it to API
    api.setEntityID(Object.keys(entities)[0]);
    // Check to see if the processes ID shash matches the expected 8-4-4-4-12 format
    expect(api.getEntityID()).toMatch(/[^-]{8}-[^-]{4}-[^-]{4}-[^-]{4}-[^-]{12}/);

    // This function is for dynamic metadata
    const entity = await api.getEntity();
    expect(entity).toBeDefined();
  });

  it("should run an unsuccessful API client call", async () => {

    let cfg = { Email: "", Password: "", M2MGO_Entity: "" } as ComponentConfig;

    const api = new APIClient(cfg);
    // test bad Login
    expect(await api.fetchToken()).toBeFalsy();
  });
}


