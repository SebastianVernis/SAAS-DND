
> @saas-dnd/web@1.0.0 test
> vitest


[1m[46m RUN [49m[22m [36mv4.0.15 [39m[90m/app/apps/web[39m

 [32m✓[39m src/pages/auth/__tests__/Login.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 473[2mms[22m[39m
     [33m[2m✓[22m[39m renders the login form [33m 471[2mms[22m[39m
 [32m✓[39m src/pages/auth/__tests__/Register.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 510[2mms[22m[39m
     [33m[2m✓[22m[39m renders the register form [33m 508[2mms[22m[39m
 [32m✓[39m src/pages/auth/__tests__/VerifyOTP.test.tsx [2m([22m[2m1 test[22m[2m)[22m[33m 488[2mms[22m[39m
     [33m[2m✓[22m[39m renders the OTP form [33m 485[2mms[22m[39m
 [32m✓[39m src/components/__tests__/EditorIframe.test.tsx [2m([22m[2m1 test[22m[2m)[22m[32m 105[2mms[22m[39m

[2m Test Files [22m [1m[32m4 passed[39m[22m[90m (4)[39m
[2m      Tests [22m [1m[32m4 passed[39m[22m[90m (4)[39m
[2m   Start at [22m 20:03:18
[2m   Duration [22m 3.12s[2m (transform 418ms, setup 413ms, import 1.37s, tests 1.58s, environment 2.89s)[22m


> @saas-dnd/web@1.0.0 test:e2e
> playwright test


Running 3 tests using 2 workers

[1A[2K[1/3] [chromium] › tests/auth.spec.ts:4:3 › Authentication › should allow a user to register and verify their account
[1A[2K[2/3] [chromium] › tests/auth.spec.ts:28:3 › Authentication › should allow a user to log in
[1A[2K[3/3] [chromium] › tests/landing.spec.ts:4:3 › Landing Page › should allow interaction with the iframe demo
[1A[2K  3 passed (4.1s)
