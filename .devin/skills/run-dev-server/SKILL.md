---
name: run-dev-server
description: Start the local Angular dev server on http://localhost:4200. Use
  when you need to run the app locally for manual testing or browser preview.
model: swe
allowed-tools:
  - read
  - grep
  - glob
  - exec
---

# Run the Angular Dev Server

This is Angular 9 on modern Node, so the dev server needs the legacy OpenSSL
provider or it crashes immediately with `ERR_OSSL_EVP_UNSUPPORTED`.

1. Check whether port 4200 is already serving. If a previous `ng serve` is
   running, either reuse it or free the port first:

       lsof -i :4200 -sTCP:LISTEN -n -P    # find PID(s)
       kill <PID>                          # stop the old server

2. Start the dev server with the OpenSSL legacy flag (run non-blocking so it
   keeps serving):

       NODE_OPTIONS=--openssl-legacy-provider npm start

3. Wait for the compile to finish. Startup takes a few seconds; success looks
   like:

       ** Angular Live Development Server is listening on localhost:4200 ... **
       : Compiled successfully.

   The `DEP0060 util._extend` deprecation warning on startup is harmless —
   ignore it.

4. Open http://localhost:4200/ in the browser to verify the app loads.
