import Axios from "axios";
import { AxiosInstance } from "axios";
import { ComponentConfig } from "./models/componentConfig";

export interface APIResult {
  success: boolean;
  data: any;
  related_objects: any;
}

export interface Credentials {
  Email: string;
  Password: string;
}

// https://pst.m2mgo.com/api/cms/membership-user/token
// https://pst.m2mgo.com/api/prototypeentities/entities/eb569bd2-eb72-429b-a3f1-59482fb05b80

export class APIClient {
  private http: AxiosInstance;
  private credentials: Credentials;
  private entityID: string;

  constructor(cfg: ComponentConfig) {
    this.http = Axios.create({
      baseURL: "https://pst.m2mgo.com/api",
      headers: { Authorization: "" }
    });

    this.credentials = { Email: cfg.Email, Password: cfg.Password };
    this.entityID = cfg.M2MGO_Entity;

    // Tokens have a lifetime of 30 mins.This interceptor will have a chance
    // to process the response before it is returned to the component logic
    // and will attempt to refresh the bearer token if the response is a 401
    // error.
    this.http.interceptors.response.use(
      response => response,
      error => {
        // console.log("error", error.response.status);
        if (error.response.status === 401) {
          this.http.post("/cms/membership-user/token", this.credentials).then(r => {
            this.http.defaults.headers["Authorization"] = r.data.TokenPrefix + " " + r.data.Token;
            error.response.config.headers["Authorization"] = r.data.TokenPrefix + " " + r.data.Token;
            return this.http.request(error.response.config);
          }).catch(error => {
            throw error;
          });
        }
        else {
          // No special handler for non 401 errors
          return error;
        }
      });
  }

  // This function will attempt to fetch an initial auth token
  // TODO remove once the response interceptor is verified to work.
  async fetchToken(): Promise<boolean> {
    const resp = await this.http.post("/cms/membership-user/token", this.credentials);
    // console.log(resp.status);
    // check for status
    if (resp.status === 200) {
      this.http.defaults.headers["Authorization"] = resp.data.TokenPrefix + " " + resp.data.Token;
      return true;
    } else {
      return false;
    }

  }

  async getEntities() {
    let list = {};
    try {
      const resp = await this.http.get("/prototypeentities/types/all");
      console.log("resp", resp);
      const payload = resp.data;
      // console.log(resp.data);
      // TODO filter with JSONata
      for (const key in payload) {
        const ID = payload[key].Identifier.ID;
        const Label = payload[key].Label;
        list[ID] = Label;
      }
    } catch (error) {
      console.log(error);
    }
    // console.log("list",list);
    return list;
  }

  async getEntity() {

    const resp = await this.http.get("https://pst.m2mgo.com/api/prototypeentities/types/" + this.entityID);
    // TODO filter with JSONata
    return resp.data;
  }

  async insertRow(payload: any): Promise<any> {
    const response = await this.http.post("/prototypeentities/entities/" + this.entityID, payload, { responseType: "json" });
    const result = <APIResult>response.data;
    if (!result.success) {
      throw new Error("could not entity for endpoint" + this.entityID);
    }
    return result.data;
  }

  getEntityID(): string {
    return this.entityID;
  }
  setEntityID(id: string) {
    this.entityID = id;
  }
}
