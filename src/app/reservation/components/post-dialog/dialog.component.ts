import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { ReservationApiService } from '../../services/reservation-api.service';
import { DatePipe } from '@angular/common';
import { StateApiService } from 'src/app/state/services/state-api.service';
import { Observable, Subscription, filter, map, of, tap } from 'rxjs';
import { State } from 'src/app/state/models/state.model';
import { ClienteApiService } from 'src/app/client/services/client-api.service';
import { Cliente } from 'src/app/client/models/client.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog-reservation',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.sass'],
  providers: [ReservationApiService, DatePipe, StateApiService, ClienteApiService]
})

export class DialogComponentReservation implements OnInit, OnDestroy {
  reservationForm!: FormGroup;
  state$: Observable<State[]> = of([]);
  clients$: Observable<Cliente[]> = of([]);
  subscriptions: Subscription[] = [];
  SUCCESS_MESSAGE = "Reserva registrada con éxito."
  FAILURE_MESSAGE = "Hubo un error al registrar la reserva."
  DISSMISS_MESSAGE = "Ocultar"

  constructor(
    @Inject(MAT_DIALOG_DATA) public editReservation : any,
    private formBuilder: FormBuilder,
    private reservationApiService: ReservationApiService,
    private dialogRef: MatDialogRef<DialogComponentReservation>,
    private stateApiService: StateApiService,
    private clientService: ClienteApiService,
    private _snackBar: MatSnackBar,
  ){}


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  ngOnInit(): void {
    this.reservationForm = this.formBuilder.group({
      title: ["", Validators.required],
      reason: ["", Validators.required],
      time: ["", Validators.required],
      ammount: ["", Validators.required],
      state: ["", Validators.required],
      client: ["", Validators.required],
    })
    this.state$ = this.stateApiService.getState();
    this.clients$ = this.clientService.getClientes();
  }

  addReservation() {
    const dtoReservation = {
      ...this.reservationForm.value,
      time: this.reservationForm.value.time.toISOString().split('T')[0],
    }

    if (this.reservationForm.valid) {
      this.subscriptions.push(
        this.reservationApiService.addReservation(dtoReservation).subscribe({
          next: (res) => {
            this._snackBar.open(this.SUCCESS_MESSAGE, this.DISSMISS_MESSAGE);
            this.dialogRef.close();
          },
          error: (res) => {
            this._snackBar.open(this.FAILURE_MESSAGE, this.DISSMISS_MESSAGE);
            this.dialogRef.close();
          }
        })
      )
    }
  }
}
