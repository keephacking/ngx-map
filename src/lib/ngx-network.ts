import { merge, of, fromEvent } from "rxjs";
import { mapTo } from "rxjs/operators";

export class NgxNetwork {
  public getStatus() {
    return new Promise((resolve, reject) => {
      resolve(navigator.onLine);
    });
  }

  public onChange() {
    return merge(of(navigator.onLine), fromEvent(window, "online").pipe(mapTo(true)), fromEvent(window, "offline").pipe(mapTo(false)));
  }
}
const Network = new NgxNetwork();

export { Network };
