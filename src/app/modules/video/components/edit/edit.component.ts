import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
import { FormControl, FormGroup, Validator, Validators } from '@angular/forms';
import { retry } from 'rxjs';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnChanges, OnInit, OnDestroy {

  @Input() activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  public alertColor = 'blue';
  public alertMsg = 'Please wait! Your clip is being updated.';
  public showAlert = false;
  public inSubmission = false;

  public clipID = new FormControl('');
  public title = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
  ]);

  public editForm = new FormGroup({
    id: this.clipID,
    title: this.title,
  });

  constructor(
    private modal: ModalService,
    private clipService: ClipService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if(!this.activeClip) {
      return
    }

    this.inSubmission = false;
    this.showAlert = false;

    this.clipID.setValue(this.activeClip.docID as string);
    this.title.setValue(this.activeClip.title)
  }

  ngOnInit(): void {
    this.modal.regiser('editClip');
  }

  ngOnDestroy(): void {
    this.modal.unRegister('editClip');
  }

  async submit(){
    if(!this.activeClip) {
      return
    }
    this.inSubmission = true;
    this.showAlert = true;
    this.alertColor = 'blue'
    this.alertMsg = 'Please wait! Your clip is being updated.';

    try {
      await this.clipService.updateClip(this.clipID.value as string, this.title.value as string)
    } catch (error) {
      this.inSubmission = false;
      this.alertColor = 'red';
      this.alertMsg = 'Something went wrong! Try again later.'
      console.log(error);

      return
    }

    this.activeClip.title = this.title.value as string;
    this.update.emit(this.activeClip);

    this.inSubmission = false;
    this.alertColor = ' green';
    this.alertMsg = 'Success!';
  }

}
