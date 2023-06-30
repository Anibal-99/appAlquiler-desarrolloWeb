import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { ReservationApiService } from '../../reservation.service';
import { DatePipe } from '@angular/common';
import { StateApiService } from 'src/app/state/services/state-api.service';
import { Observable, Subscription, filter, map, of, tap } from 'rxjs';
import { State } from 'src/app/state/models/state.model';
import { ClienteApiService } from 'src/app/client/services/client-api.service';
import { Cliente } from 'src/app/client/models/client.model';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Dialog for adding new reservations
*/
@Component({
  selector: 'app-add-dialog-reservation',
  templateUrl: './add-reservation-dialog.component.html',
  styleUrls: ['./add-reservation-dialog.component.sass'],
  providers: [ReservationApiService, DatePipe, StateApiService, ClienteApiService]
})

export class AddDialogComponentReservation implements OnInit, OnDestroy {
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
    private dialogRef: MatDialogRef<AddDialogComponentReservation>,
    private stateApiService: StateApiService,
    private clientService: ClienteApiService,
    private _snackBar: MatSnackBar,
  ){}
  actionBtn : string = 'Guardar'


  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }


  ngOnInit(): void {
    this.reservationForm = this.formBuilder.group({
      title: [this.editReservation?.titulo ?? "", Validators.required],
      reason: [this.editReservation?.razon ?? "", Validators.required],
      date: [new Date(this.editReservation?.fecha) ?? "", Validators.required],
      ammount: [this.editReservation?.monto ?? "", Validators.required],
      state: [this.editReservation?.estado ?? "", Validators.required],
      client: [this.editReservation?.cliente ?? "", Validators.required],
    })
    this.state$ = this.stateApiService.getState();
    this.clients$ = this.clientService.getClientes();
  }

  addReservation() {
      if(!this.editReservation){
        if (this.reservationForm.valid) {
          const dtoReservation = {...this.reservationForm.value,
            date: this.reservationForm.value.date.toISOString().split('T')[0],
          }
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
    }else{
      this.updateReservation();
    }
  }

  updateReservation(){
    const dtoReservation = {...this.reservationForm.value,
      date: this.reservationForm.value.date.toISOString().split('T')[0],
    }
    console.log(dtoReservation)
    this.reservationApiService.updateReservation(this.editReservation.id, dtoReservation)
  }
}
