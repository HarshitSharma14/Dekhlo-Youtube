import React from "react";
import { GOOGLE_AUTH_URL } from "../../utils/constants.js";

const Auth = () => {
  return (
    <>
      <a class="button google" href={GOOGLE_AUTH_URL}>
        Sign in with Google
      </a>
    </>
  );
};

export default Auth;
