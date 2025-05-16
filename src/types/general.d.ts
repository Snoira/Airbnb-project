import { SafeUser } from "./user";

type ErrorObject = {
  [key: string]: any;
};

type APIOptions = {
  params: {
    [key: string]: string;
  };
};

type IncludeObj = {
  include: {
    [key: string]: boolean;
  };
};

type SessionObj = {
  isAuth: boolean;
  user: SafeUser | null;
};

type SessionToken = {
  token: string;
  expiresAt: Date;
};
