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

//Comparison operators for m2mgo search api.
export enum comparisonOperators { Greater = 0, GreaterOrEquals = 1, Lower = 2, LowerOrEquals = 3, Equals = 4, Contains = 5 }

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

    /**
     * Received responses will be piped through this callback, it will ignore 2XX responses.
     * 401 error responses will trigger a re-login attempt. If login is successful, the failed request
     * will be immediately repeated with new login token.
     * Other error responses will be ignored.
     */
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

  /**
   * Will search the table for a single item. /prototypeentities/entities/{entityID}/search
   * payload = { 
                Filter: [ // the Filter is an array of objects. Each object here should specify a search criterion over a single column:
                    {
                        ColumnKey: pkColumnKey,              //key value of column we want to filter
                        Comparer: 4,   // the filter type 4 is simpl equal
                        ColumnValue: valueToSearchFor      //the filter value
                    }
                ],
                PageSize: 99999,    //how many results you want to have back (by default 10)
                TimezoneOffset: 0   //Slice by timestamp, would be modified by 
            }
   * 
   */

  async searchRow(payload: any) {
    try {
      const resp = await this.http.post("/prototypeentities/entities/" + this.entityID + "/search", payload, { responseType: "json" });
      return resp.data;
    } catch (error) {
      return undefined;
    }
  }

  /**
   * The api to update a row is /prototypeentities/entities/{entityID}/{rowId}
   * will update a single item
          payload = {
              Values: {
                  key1: ‘new value for key1',
                  key2: 'new value for key2’
              }
          }
 */
  async updateRow(payload: any, rowId: string) {
    try {
      const resp = await this.http.post("/prototypeentities/entities/" + this.entityID + "/" + rowId, payload, { responseType: "json" });
      return resp;
    } catch (error) {
      //console.log("error", error);
      return error;
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
