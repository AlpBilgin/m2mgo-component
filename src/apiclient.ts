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
        this.http.defaults.headers["Authorization"] = resp.data.TokenPrefix + " " + resp.data.Token;
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
    let resp;
    try {
      resp = await this.http.get("/prototypeentities/types/all");
      // console.log(resp.data);
    } catch (error) {
      // If an error is thrown due to invalid token refresh token
      if (error.response && error.response.status === 401) {
        return this.refreshtoken(
          () => this.getEntities()
        );
      }
      // Otherwise throw generic error
      else {
        throw new Error("Entities can't be fetched!");
      }
    }
    return resp.data;
  }

  // This function will fetch detailed information about one data structure with given ID hash.
  async getEntity() {
    // Fetch a single entity definition.
    let resp;
    try {
      resp = await this.http.get("https://pst.m2mgo.com/api/prototypeentities/types/" + this.entityID);
    }
    catch (error) {
      // If an error is thrown due to invalid token refresh token
      if (error.response && error.response.status === 401) {
        return this.refreshtoken(
          () => this.getEntity()
        );
      }
      // Otherwise throw generic error
      else {
        throw new Error("Entity " + this.entityID + " can't be fetched!");
      }
    }
    return resp.data;
  }

  // This function  will attempt to insert data to a table.
  async insertRow(payload: any) {
    try {
      await this.http.put("/prototypeentities/entities/" + this.entityID, payload, { responseType: "json" });
    } catch (error) {
      // If an error is thrown due to invalid token refresh token
      if (error.response && error.response.status === 401) {
        return this.refreshtoken(
          () => this.insertRow(payload)
        );
      }
      // Otherwise throw generic error
      else {
        throw new Error("could not insert data into entityID: " + this.entityID);
      }
    }
    return true;
  }

  // Meant to be used by other member functions, parameter should be the calling function itself.
  // Passing a naked fn pointer here disrupts this inheritance in TSC.
  // fn should be an arrow function that returns an call of the calling function.
  // e.g. () => this.getEntities()
  private async refreshtoken(fn) {
    // Try to fetch a new token
    const isAuth = await this.fetchToken();
    // If token is fetched try the function again, if not throw error
    if (isAuth) {
      // console.log("fetched token.");
      return fn();
    }
    else {
      // TODO this exists for easy testability. There should be a better way.
      return undefined;
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
