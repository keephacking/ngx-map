import { InjectionToken } from "@angular/core";

export const NGX_MAP_KEY = new InjectionToken<string>("NGX_MAP_KEY");

export interface NgxConfig {
  enableSelection?: boolean;
  marker?: any;
}
