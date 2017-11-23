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
// Auth attempt with bad login credentials return a 400 error
// Endpoint access attempt without logging in returns a 401 error
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

    this.http.interceptors.response.use(
      async response => response,
      async error => {
        //console.log("error", error.response.status);
        if (error.response.status === 401) {
          try {
            // For some reason if this http call returns a 400 response, error response is assigned to resp. (it should throw instead)
            const resp = await this.http.post("/cms/membership-user/token", this.credentials);
            // if response contains data field everything is okay
            if (resp.data) {
              this.updateHeaders(resp, error);
              return this.http.request(error.response.config);
            } else {
              // If interceptor gets a 400 error, this block is executed. It simply returns the original 401 error.
              console.log("asf");
              return error;
            }
          }
          catch (error) {
            //console.log("401", error);
            return error;
          }
        }
        else {
          // No special handler for non 401 errors
          // console.log("400", error);
          return error;
        }
      });
  }

  private updateHeaders(resp, error?) {
    const prefix = resp.data.TokenPrefix;
    const token = resp.data.Token;
    this.http.defaults.headers["Authorization"] = prefix + " " + token;
    if (error) {
      error.response.config.headers["Authorization"] = prefix + " " + token;
    }
  }

  // This function will attempt to fetch an initial auth token
  // bad login creds return 400
  async fetchToken(): Promise<boolean> {
    // console.log("fetchToken credentials: ", this.credentials);
    try {
      const resp = await this.http.post("/cms/membership-user/token", this.credentials);
      // check for status code
      if (resp.status === 200) {
        // Extract the Auth token from response body and set as a default header. 
        this.updateHeaders(resp);
        return true;
      } else {
        return false;
      }
    } catch (e) {
      // console.log("fetchToken throw: ", e);
      return false;
    }
  }

  // This function will fetch detailed information about all data structures.
  async getEntities() {
    try {
      const resp = await this.http.get("/prototypeentities/types/all");
      // console.log(resp.data);
      return resp.data;
    } catch (error) {
      // return undefined literal.
      // console.log(error);
      return undefined;
    }
  }

  // This function will fetch detailed information about one data structure with given ID hash.
  async getEntity() {
    // Fetch a single entity definition.
    try {
      const resp = await this.http.get("https://pst.m2mgo.com/api/prototypeentities/types/" + this.entityID);
      return resp.data;
    }
    catch (error) {
      // return undefined
      return undefined;
    }
  }

  // This function  will attempt to insert data to a table.
  async insertRow(payload: any) {
    try {
      await this.http.put("/prototypeentities/entities/" + this.entityID, payload, { responseType: "json" });
      return true;
    } catch (error) {
      // return false
      return false;
    }
  }

  // get and set helper functions for testing
  getEntityID(): string {
    return this.entityID;
  }
  setEntityID(id: string) {
    this.entityID = id;
  }
}
