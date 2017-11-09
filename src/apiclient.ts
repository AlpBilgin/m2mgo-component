import Axios from "axios";
import { AxiosInstance } from "axios";
import { ComponentConfig } from "./models/componentConfig";

// TODO restructure according to M2MGO api
/*
export interface APIResult {
  success: boolean;
  data: any;
  related_objects: any;
}
*/

export interface Credentials {
  Email: string;
  Password: string;
}

export class APIClient {
  private http: AxiosInstance;
  private credentials: Credentials;
  private entityID: string;

  constructor(cfg: ComponentConfig) {
    this.http = Axios.create({
      baseURL: "https://pst.m2mgo.com/api",
      headers: { Authorization: "" }
    });

    this.credentials = { Email: cfg.email, Password: cfg.password };
    this.entityID = cfg.M2MGO_Entity;

    // Tokens have a lifetime of 30 mins.This interceptor will have a chance
    // to process the response before it is returned to the component logic
    // and will attempt to refresh the bearer token if the response is a 401
    // error.
    // TODO stress test to see if it actually works
    this.http.interceptors.response.use(
      response => response,
      error => {
        // console.log("error", error);
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
  async fetchToken(): Promise<boolean> {
    // console.log("fetchToken credentials: ", this.credentials);
    try {
      const resp = await this.http.post("/cms/membership-user/token", this.credentials);
      // console.log("fetchToken resp: ", resp);
      // console.log("fetchToken status: ", resp.status);
      // check for status code
      if (resp.status === 200) {
        // Harvest the Auth token from response body and set as a default header. 
        this.http.defaults.headers["Authorization"] = resp.data.TokenPrefix + " " + resp.data.Token;
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log("fetchToken throw: ", e);
      return false;
    }

  }

  // This function will fetch detailed information about all data structures.
  async getEntities() {
    let resp;
    // TODO do proper error handling
    try {
      resp = await this.http.get("/prototypeentities/types/all");
      // console.log(resp.data);
    } catch (error) {
      console.log(error);
    }
    return resp.data;
    // console.log("list",list);
  }

  // This function will fetch detailed information about one data structure with given ID hash.
  async getEntity() {
    // Fetch a single entity definition.
    // TODO try catch error handling
    const resp = await this.http.get("https://pst.m2mgo.com/api/prototypeentities/types/" + this.entityID);
    return resp.data;
  }

  // This function  will attempt to insert data to a table.
  async insertRow(payload: any): Promise<any> {
    // TODO try catch error handling
    const response = await this.http.put("/prototypeentities/entities/" + this.entityID, payload, { responseType: "json" });
    if (response.status !== 200) {
      throw new Error("could not insert data into entityID: " + this.entityID);
    }
    return true;
  }

  // get and set helper functions for testing
  getEntityID(): string {
    return this.entityID;
  }
  setEntityID(id: string) {
    this.entityID = id;
  }
}
