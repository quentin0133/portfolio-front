import { Pipe, PipeTransform } from '@angular/core';
import { catchError, map, Observable, of, startWith } from 'rxjs';

interface LoadingState {
  state: 'loading';
}

interface SuccessState<T> {
  state: 'success';
  data: T;
}

interface ErrorState {
  state: 'error';
  error: Error;
}

export type State<T> = LoadingState | SuccessState<T> | ErrorState;

@Pipe({
  name: 'loadingState',
  standalone: true,
})
export class LoadingStatePipe implements PipeTransform {
  transform<T>(val: Observable<T>): Observable<State<T>> {
    return val.pipe(
      map((data) => ({ state: 'success', data }) as SuccessState<T>),
      startWith({ state: 'loading' } as LoadingState),
      catchError((error) => of({ state: 'error', error } as ErrorState)),
    );
  }
}

export function isLoading<T>(state: State<T>): state is LoadingState {
  return state.state === 'loading';
}

export function isSuccess<T>(state: State<T>): state is SuccessState<T> {
  return state.state === 'success';
}

export function isError<T>(state: State<T>): state is ErrorState {
  return state.state === 'error';
}
