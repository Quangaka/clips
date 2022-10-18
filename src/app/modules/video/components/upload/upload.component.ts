import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuidv4 } from 'uuid';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit, OnDestroy {

  public isDragOver = false;
  public file: File | null = null;
  public nextStep = false;
  public showAlert = false;
  public alertColor = 'blue';
  public alertMsg = 'Please wait! Your clip is being uploaded';
  public inSubmission = false;
  public percentage = 0;
  public showPercentage = false;
  public user: firebase.User | null = null;
  public uploadTask?: AngularFireUploadTask;
  public screenshots: string[] = [];
  public selectedScreenshot = '';
  public screenshotUploadTask?: AngularFireUploadTask;

  title = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ]);
  upLoadForm = new FormGroup({
    title: this.title,
  })

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) { 
    auth.user.subscribe(user => this.user = user);
    this.ffmpegService.init();
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.uploadTask?.cancel();
  }

  async storeFile($event: Event) {
    if(this.ffmpegService.isRunning) {
      return;
    }

    this.isDragOver = false;

    this.file = ($event as DragEvent).dataTransfer ?
    ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
    ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if(!this.file || this.file?.type !== 'video/mp4') {
      return
    }

    this.screenshots = await this.ffmpegService.getScreenShots(this.file);

    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    )
    this.nextStep = true;
  }

  async upLoadFile() {
    this.upLoadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertColor = 'Please wait! Your clip is being uploaded';
    this.inSubmission = true;

    const clipFileName = uuidv4()
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );

    const screenshotPath = `screenshots/${clipFileName}.png`;
    
    this.uploadTask = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotUploadTask = this.storage.upload(
      screenshotPath, screenshotBlob
    );

    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.uploadTask.percentageChanges(),
      this.screenshotUploadTask.percentageChanges()
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;

      if(!clipProgress || !screenshotProgress) {
        return;
      }

      const total = clipProgress + screenshotProgress;
      this.percentage = total as number / 100;
    })

    forkJoin([
      this.uploadTask.snapshotChanges(),
      this.screenshotUploadTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipURL, screenshotURL] = urls;
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url: clipURL,
          screenshotURL,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }

        const clipRef = await this.clipService.createClip(clip);

        this.alertColor = 'green';
        this.alertMsg = 'Success! Your  clip is now ready to share with the world.';
        this.showPercentage = false;

        setTimeout(() => {
          this.router.navigate([
            'clip', clipRef.id
          ])
        }, 1000)
      },
      error: (error) => {
        this.upLoadForm.enable();

        this.alertColor = 'red';
        this.alertMsg = 'Upload failed! Please try again later.';
        this.inSubmission = true;
        this.showPercentage = false;
        console.log(error);
      }
    })
  }
}
