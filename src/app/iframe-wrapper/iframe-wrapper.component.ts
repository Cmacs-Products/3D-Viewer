import { Component, OnInit, HostListener, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as uuid from 'uuid';
import { IFrameExchangeData, IFrameEvent } from 'src/models/iframe-exchange-data';
import { Subscription, Observable } from 'rxjs';

@Component({
  selector: 'app-iframe-wrapper',
  templateUrl: './iframe-wrapper.component.html',
  styleUrls: ['./iframe-wrapper.component.css']
})


/*#################################################################################

Note!!!
Make sure the following line is included in your html:
<script src="/ClientApp/src/assets/scripts/common/iframeExchange.js"></script>

#################################################################################*/


// the function of this component is to wrap around an iframe and tommunicate information between angular and the iframe
export class IFrameWrapper implements OnInit, AfterViewInit {
  // unique identifier for the iframe (random uuid)
  ExchangeId : string = uuid.v4();
  // url to be loaded in the iframe
  IFrameURL: SafeResourceUrl | undefined;
  // the iframe itself
  IFrame: HTMLIFrameElement | undefined | null;
  // event subsciption for parent events
  private parentEventsSubscription: Subscription | undefined;

  // two types of events: 'Loaded' will only be calle once. you cannot send events before this is done.
  @Output() Loaded: EventEmitter<boolean> = new EventEmitter<boolean>();
  // the second type of event 
  @Output() ChildEvents: EventEmitter<IFrameEvent> = new EventEmitter<IFrameEvent>();

  @Input() 
  set iframeId(id: string | undefined) {
    if(typeof id === "undefined"){
      return;
    }
    this.ExchangeId = id;
  }
  get iframeId(){
    return this.ExchangeId;
  };
  
  @Input() 
  set URL(thisUrl:string|undefined){
    if (typeof thisUrl === 'undefined' ){return;}
    this.IFrameURL = this.domSanitizer.bypassSecurityTrustResourceUrl(thisUrl + (thisUrl.includes('?') ? '&' : '?') + "exchangeId=" + this.ExchangeId);
  }
  get URL(){
    return this.IFrameURL as string;
  }

  @Input() viewerHeight: number|undefined;


  // to handle the events gracefully, we intecept them and pass them straight to 'postMessage event'
  // _parentEvent: IFrameEvent = new IFrameEvent();
  @Input() ParentEvents: Observable<IFrameEvent>|undefined;

  constructor(
    public domSanitizer: DomSanitizer,

  ) {}

  ngOnInit() {
    if (this.ParentEvents != undefined){
      this.parentEventsSubscription = this.ParentEvents.subscribe((event: IFrameEvent) => this.postMessage(event));
    }
  }

  ngOnDestroy(){
    if (this.parentEventsSubscription !== undefined)
    {
      this.parentEventsSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    // bind event ??

  }

  // get the iframe of interest
  getIFrame(){
    if (typeof this.IFrame === 'undefined' || this.IFrame === null){
      this.IFrame = document.getElementById(this.ExchangeId) as HTMLIFrameElement;
    }
    return this.IFrame;
  }

  // method that messages the iframe
  postMessage(event : IFrameEvent) {
    let iFrame = this.getIFrame();
    if (typeof iFrame !== 'undefined' && iFrame !== null && iFrame.contentWindow !== null) {
      let window = (iFrame.contentWindow as Window);
      window.postMessage(
        new IFrameExchangeData(this.ExchangeId,event),
        '*'
      );
    }
  }

  // listen to any message events from the iframe (but as per good practice we are listening on the window) 
  @HostListener('window:message', ['$event'])
  onMessage(ev: MessageEvent) {
    // only listen to our iframe, events from which will have the right exchangeId
    if (ev.data.exchangeId !== this.ExchangeId) { return; }
    let data = ev.data as IFrameExchangeData;
    // message the parent component
    this.ChildEvents.emit(data.event as IFrameEvent);
  }

  onIframeLoad(exchangeId: string) {
    if (exchangeId === this.ExchangeId) {
      // this will trigger the Loaded event on the parent component
      this.Loaded.emit(true);
    }
  }
}
