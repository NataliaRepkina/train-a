import { createReducer, on } from '@ngrx/store';
import { UserState } from '../../models/user.model';
import {
  clearError,
  getError,
  getToken,
  getUser,
  saveUser,
  signIn,
  signOut,
  signUp,
  successfulExit,
  successfulUpdate,
  updateUserName,
  updateUserPassword,
} from './user.actions';

const initialUserState: UserState = {
  currentAccess: 'guest',
  currentUser: {
    email: '',
    name: '',
    password: '',
  },
  token: '',
  hasError: {
    message: '',
    reason: '',
  },
};

export const userReducer = createReducer(
  initialUserState,
  on(signUp, (state, { email, password }): UserState => {
    return { ...state, currentUser: { email, name: '', password } };
  }),
  on(signIn, (state, { email, password }): UserState => {
    return {
      ...state,
      currentUser: { email, name: '', password },
    };
  }),
  on(getToken, (state, { token }): UserState => {
    return { ...state, token };
  }),
  on(getUser, (state): UserState => {
    return { ...state };
  }),
  on(saveUser, (state, { name, email, role }): UserState => {
    return {
      ...state,
      currentUser: { email, name, password: state.currentUser.password },
      currentAccess: role,
    };
  }),
  on(updateUserName, (state, { name, email }): UserState => {
    return {
      ...state,
      currentUser: { email, name, password: state.currentUser.password },
    };
  }),
  on(updateUserPassword, (state, { newPassword }): UserState => {
    return {
      ...state,
      currentUser: {
        email: state.currentUser.email,
        name: state.currentUser.name,
        password: newPassword,
      },
    };
  }),
  on(successfulUpdate, (state): UserState => {
    return { ...state };
  }),
  on(signOut, (state): UserState => {
    return {
      ...state,
      currentAccess: 'guest',
      currentUser: { email: '', name: '', password: '' },
      token: '',
    };
  }),
  on(successfulExit, (state): UserState => {
    return { ...state };
  }),
  on(getError, (state, { error }): UserState => {
    return { ...state, hasError: { ...error } };
  }),
  on(clearError, (state): UserState => {
    return { ...state, hasError: { message: '', reason: '' } };
  }),
);
