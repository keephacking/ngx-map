export class List {
  items: any[] = [];
  constructor() {}

  add(item) {
    this.items.push(item);
  }
  remove(item) {
    var indexOf = this.items.indexOf(item);
    if (indexOf !== -1) {
      this.items.splice(indexOf, 1);
    }
  }
  find(callback: Function, action) {
    let callBackReturn,
      items = this.items,
      length = items.length,
      matches = [],
      i = 0;
    for (; i < length; i++) {
      callBackReturn = callback(items[i], i);
      if (callBackReturn) {
        matches.push(items[i]);
      }
    }
    if (action) {
      action.call(this, matches);
    }
    return matches;
  }
}
