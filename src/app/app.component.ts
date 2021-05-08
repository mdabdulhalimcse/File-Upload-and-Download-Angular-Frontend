import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  filenames: string[] = [];
  fileStatus = {status: '', requestType: 'Uploading...', percent: 0};
  
  constructor(private fileService: FileService){}

  //upload files
  onUploadFiles(files: File[]): void {
    const formData = new FormData();
    for(const file of files){ formData.append('files', file, file.name);}
    this.fileService.upload(formData).subscribe(
      event => {
        console.log(event);
        this.resportProgress(event);
      },
      (error: HttpErrorResponse) => {
      console.log(error);
      }
    );

  }

   //download files
   onDownloadFile(filename: string): void {
    this.fileService.download(filename).subscribe(
      event => {
        console.log(event);
        this.resportProgress(event);
      },
      (error: HttpErrorResponse) => {
      console.log(error);
      }
    );

  }

  private resportProgress(HttpEvent: HttpEvent<string[] | Blob>): void {
    switch(HttpEvent.type) {
      case HttpEventType.UploadProgress: 
      this.updateStatus(HttpEvent.loaded, HttpEvent.total!, 'Uploading');
      break;

      case HttpEventType.DownloadProgress: 
      this.updateStatus(HttpEvent.loaded, HttpEvent.total!, 'Downloading');
      break;

      case HttpEventType.ResponseHeader:
        console.log('Header returned', HttpEvent);
      break;

      case HttpEventType.Response: 
      if(HttpEvent.body instanceof Array) {
        for(const filename of HttpEvent.body){
            this.filenames.unshift(filename);
        }
      } else{
        //download logic
        saveAs(new File([HttpEvent.body!], HttpEvent.headers.get('File-Name')!,
           {type: `${HttpEvent.headers.get('Content-Type')};charset=utf-8` }));


        // saveAs(new Blob([HttpEvent.body!], 
        //   {type: `${HttpEvent.headers.get('Content-Type')};charset=utf-8` }),
        // HttpEvent.headers.get('File-Name'));
      }
      this.fileStatus.status = 'done';
      break;
      default:
        
        console.log(HttpEvent);
        break;
    }
  }
  private updateStatus(loaded: number, total: number , requestType: string) {
    this.fileStatus.status = 'progress';
    this.fileStatus.requestType = requestType;
    this.fileStatus.percent = Math.round( 100 * loaded / total);
  }

}
