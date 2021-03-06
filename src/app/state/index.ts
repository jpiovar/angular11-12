import { ConfigState } from './config/config.models';
import { SpinnerState } from './spinner/spinner.models';
import { ToastrState } from './toastr/toastr.models';
import { RecordsState } from './records/records.models';

export interface AppState {
  readonly router: any;
  readonly spinner: SpinnerState;
  readonly config: ConfigState;
  readonly toastr: ToastrState;
  readonly records: RecordsState;
}
