export class IFrameEvent{
    eventType: string;
    value: any
    constructor(_eventType?:string, _value?:any) {
      this.eventType = _eventType || '';
      this.value = _value;
    }
}

export class IFrameExchangeData {
    exchangeId: string;
    event: IFrameEvent;

    constructor(_exchangeId: string, _event: IFrameEvent){
        this.exchangeId = _exchangeId;
        this.event = _event;
    }
}
