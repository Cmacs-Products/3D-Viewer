import { Observable, Subject } from "rxjs";
import { HttpClient, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
  })
export class DocumentService{

  protected _threeDViewerLoading: boolean = false;
  
  threeDViewerLoading$: Subject<boolean> = new Subject<boolean>();
  threeDViewerLoadingMessage$: Subject<string> = new Subject<string>();
    constructor(
        protected http: HttpClient){

        }

        isThreeDViewerLoading(): boolean {
          return this._threeDViewerLoading;
        }
      
        setThreeDViewerLoading(isLoading: boolean, shouldTrigger: boolean) {
          this._threeDViewerLoading = isLoading;
          if (shouldTrigger) {
            this.threeDViewerLoading$.next(this._threeDViewerLoading);
          }
        }
      
    
DownloadDocument(documentID: string): Observable<any> {
    return this.http.get('api/Document/GetPresignedURL/' + documentID);
  }
}