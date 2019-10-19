import { Directive, Renderer2, ElementRef, Inject, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { NGX_MAP_KEY } from "./ngx-map.config";
import { Network } from "./ngx-network";
import { Mapster } from './mapster/mapster';
import { DOCUMENT } from '@angular/common';

declare var google: any;
export class MapStatus {
  connected: boolean;
  instance?: any;
  message?: string;
}
@Directive({
  selector: "[ngxMap]"
})
export class NgxMapDirective implements OnInit,OnChanges {

  mapster:Mapster;
  @Input("view")
  viewMarker: any = null;
  @Input("ngxMap")
  options: any = null;
  @Input("placeSelectable")
  isPlaceSelectable: any = null;
  @Output("mapInit")
  onInit: EventEmitter<MapStatus> = new EventEmitter<MapStatus>();

  public markers: any[] = [];
  private mapsLoaded: boolean = false;
  private networkHandler = null;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    @Inject(DOCUMENT) private _document,
    @Inject(NGX_MAP_KEY) private apiKey
  ) {
    console.log("inside ngx map");
  }

  async ngOnInit() {
    this.renderer.setStyle(this.element.nativeElement, "height", "100%");
    this.init().then(
      res => {
        console.log("Google Maps ready.");
        this.onInit.emit({ connected: true, instance: this.mapster });

        // map options
        if(this.isPlaceSelectable) this.mapster.enableOnClickPlaceMarker();
      },
      err => {
        console.log(err);
        this.onInit.emit({ connected: false, message: err });
      }
    );
  }

  ngOnChanges(changes:SimpleChanges): void {
  }

  private init(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loadSDK().then(
        res => {
          this.initMap().then(
            res => {
              resolve(true);
            },
            err => {
              reject(err);
            }
          );
        },
        err => {
          reject(err);
        }
      );
    });
  }

  private loadSDK(): Promise<any> {
    console.log("Loading Google Maps SDK");

    return new Promise((resolve, reject) => {
      const isGoogleMapLoaded = "google" in window && typeof google === "object" && typeof google.maps === "object";
      if (!this.mapsLoaded && !isGoogleMapLoaded) {
        Network.getStatus().then(
          status => {
            if (status) {
              this.injectSDK().then(
                res => {
                  resolve(true);
                },
                err => {
                  reject(err);
                }
              );
            } else {
              if (this.networkHandler == null) {
                this.networkHandler = Network.onChange().subscribe(status => {
                  if (status) {
                    this.networkHandler.remove();

                    this.init().then(
                      res => {
                        console.log("Google Maps ready.");
                      },
                      err => {
                        console.log(err);
                      }
                    );
                  }
                });
              }

              reject("Not online");
            }
          },
          err => {
            // NOTE: navigator.onLine temporarily required until Network plugin has web implementation
            if (navigator.onLine) {
              this.injectSDK().then(
                res => {
                  resolve(true);
                },
                err => {
                  reject(err);
                }
              );
            } else {
              reject("Not online");
            }
          }
        );
      } else {
        resolve(true);
      }
    });
  }
  private injectSDK(): Promise<any> {
    return new Promise((resolve, reject) => {
      window["mapInit"] = () => {
        this.mapsLoaded = true;
        resolve(true);
      };

      let script = this.renderer.createElement("script");
      script.id = "googleMaps";

      let places="";
      if(this.isPlaceSelectable){
         places+="&libraries=places"
      }

      if (this.apiKey) {
        script.src = "https://maps.googleapis.com/maps/api/js?key=" + this.apiKey + "&callback=mapInit";
      } else {
        script.src = "https://maps.googleapis.com/maps/api/js?callback=mapInit";
      }
      script.src+=places;
      this.renderer.appendChild(this._document.body, script);
    });
  }

  private async initMap(): Promise<any> {
    console.log("init map");
    // fix center
    let position;
    if (this.viewMarker) {
      position = this.viewMarker;
    } else {
      // find the current location from browser
      let coords: any = await this.getPosition();
      console.log(coords);
      position = {
        lat: coords.latitude,
        lng: coords.longitude
      };
    }
    console.log(position);
    this.options = { ...this.options, center: new google.maps.LatLng(position.lat, position.lng) };

    return new Promise((resolve, reject) => {
      //view only
      let mapOptions = {
        zoom: 15,
        ...this.options
      };

      this.mapster = new Mapster(this.element.nativeElement, mapOptions);
      this.mapster.addMarker(position);
      resolve(true);
    });
  }
  
  public getLatLng(position) {
    return new google.maps.LatLng(position.lat, position.lng);
  }
  getPosition = () => {
    return new Promise((resolve, reject) => {
      resolve({latitude:8.743775,longitude:76.716805});
      // if (navigator && navigator.geolocation) {
      //   navigator.geolocation.getCurrentPosition(
      //     position => {
      //       resolve(position.coords);
      //     },
      //     err => {
      //       reject(err);
      //     }
      //   );
      // } else {
      //   reject("Navigator.geolocation not supported for getting current position");
      // }
    });
  };
}
