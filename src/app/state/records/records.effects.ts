import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { switchMap, map, catchError, flatMap, mergeMap, delay } from 'rxjs/operators';
import { forkJoin, Observable, Observer, of, throwError, zip } from 'rxjs';

import {
  RECORDS_LOAD,
  RECORD_LOAD_DETAIL,
  RecordsLoad,
  RecordsLoadSuccess,
  RecordsLoadFail,
  RecordLoadDetailSuccess,
  RecordLoadDetailFail,
  RecordLoadDetail,
  RECORD_SAVE,
  RecordSave,
  RecordSaveSuccess,
  RecordSaveFail
} from './records.actions';

import { RecordsState } from './records.models';
import { HttpBaseService } from '../../core/services/http.base.service';
import { environment } from '../../../environments/environment';
import { ajax } from 'rxjs/ajax';
import { Store } from '@ngrx/store';
import { AppState } from '..';
import { StartToastr } from '../toastr/toastr.actions';

@Injectable()
export class RecordsEffects {

  constructor(
    private actions$: Actions,
    private httpBase: HttpBaseService,
    private store: Store<AppState>
  ) {
    this.origin = environment.beOrigin;
  }
  origin: string;

  // @Effect()
  // recordsLoad$ = this.actions$.pipe(
  recordsLoad$ = createEffect(() => this.actions$.pipe(
    ofType(RECORDS_LOAD),
    switchMap(
      (action: RecordsLoad) => {
        // debugger;
        const urlRecords: any = action.payload;
        return this.httpBase.getCommon(`${urlRecords}`).pipe(
          map((res: any) => new RecordsLoadSuccess(res)),
          catchError(error => {
            // debugger;
            return of(new RecordsLoadFail(error));
          })
        );
      }
    )
  )
  );

  // @Effect()
  // recordLoadDetails$ = this.actions$.pipe(
  recordLoadDetails$ = createEffect(() => this.actions$.pipe(
    ofType(RECORD_LOAD_DETAIL),
    switchMap(
      (action: RecordLoadDetail) => {
        // debugger;
        const urlRecords: any = action.payload.detail;
        const id = action.payload.id;
        return this.httpBase.getCommon(`${urlRecords}`).pipe(
          map(
            (response: any) => {
              // debugger;
              const detail = response;
              return new RecordLoadDetailSuccess({ id, detail });
            }
          ),
          catchError(error => {
            // debugger;
            return of(new RecordLoadDetailFail(error));
          })
        );
      }
    )
  )
  );

  // @Effect()
  // recordSave$ = this.actions$.pipe(
  recordSave$ = createEffect(() => this.actions$.pipe(
    ofType(RECORD_SAVE),
    switchMap(
      (action: RecordSave) => {
        // debugger;
        const endPoint: any = action.payload.endPoint;
        // const endPoint = '';
        const record: any = action.payload.record;
        const actionType = action?.payload?.actionType;
        // const httpBody = taxSubjectPersonCreateEvent();
        return this.httpBase.postCommon(`${endPoint}`, record).pipe(
          map(
            (response: any) => {
              // debugger;
              const recRow = JSON.parse(JSON.stringify(record));
              if (response && (response?.eventId === recRow.eventId || response?.id === recRow.eventId) ) {
                delete recRow['event']['taxSubjectPerson']['basicDataRow'];
                delete recRow['event']['taxSubjectPerson']['addressDataRow'];
                const recordId = recRow?.event?.taxSubjectPerson.companyId || recRow?.event?.taxSubjectPerson.birthCode;
                this.store.dispatch(new StartToastr({ text: `zaznam ${recordId} byl úspěšně uložen`, type: 'success', duration: 5000 }));
                return new RecordSaveSuccess({ recordRow: recRow?.event?.taxSubjectPerson, actionType });
              }
            }
          ),
          catchError(error => {
            // debugger;
            console.log(`${endPoint}`, error);
            const recordId = record?.event?.taxSubjectPerson.companyId || record?.event?.taxSubjectPerson.birthCode;
            this.store.dispatch(new StartToastr({ text: `zaznam ${recordId} nebyl uložen`, type: 'error', duration: 5000 }));
            return of(new RecordSaveFail(error));
          })
        );
      }
    )
  )
  );

  randomProcessState(item: any): string {
    const index = Number(item?.fileNumber[item?.fileNumber.length - 1]) || 0;
    const resArr = ['', 'success', 'warning', 'error'];
    return resArr[index % 4];
  }

}