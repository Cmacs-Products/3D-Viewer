import { IframeMouseEventType } from './iframe-mouse-event-type.enum';

export class IframeMouseEventKeys {
  CTRL: boolean = false;
  SHIFT: boolean = false;
  ALT: boolean = false;
  META: boolean = false;
}

export class IframeMouseEventCoordinates {
  x: number = 0;
  y: number = 0;
}

export class IframeMouseEvent {
  type: IframeMouseEventType = IframeMouseEventType.CLICK;
  object: any;
  keys: IframeMouseEventKeys = new IframeMouseEventKeys();
  coordinates: IframeMouseEventCoordinates = new IframeMouseEventCoordinates;
  
}

