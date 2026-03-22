/**
 * Unit tests for password reset API route logic.
 * Tests the validation rules without hitting the database.
 */

// Validation helpers extracted from the route logic
function validateResetPayload(body: {
  token?: unknown;
  password?: unknown;
  userType?: unknown;
}): string | null {
  const { token, password, userType } = body;
  if (!token || !password || !['candidate', 'employer'].includes(String(userType))) {
    return 'Token, password, and valid user type are required.';
  }
  if (String(password).length < 8) {
    return 'Password must be at least 8 characters.';
  }
  return null;
}

function validateForgotPayload(body: {
  email?: unknown;
  userType?: unknown;
}): string | null {
  const { email, userType } = body;
  if (!email || !['candidate', 'employer'].includes(String(userType))) {
    return 'Valid email and user type (candidate or employer) are required.';
  }
  return null;
}

describe('reset-password validation', () => {
  it('passes with valid inputs', () => {
    expect(
      validateResetPayload({ token: 'abc123', password: 'newpass1', userType: 'candidate' })
    ).toBeNull();
  });

  it('rejects missing token', () => {
    expect(
      validateResetPayload({ password: 'newpass1', userType: 'candidate' })
    ).not.toBeNull();
  });

  it('rejects missing password', () => {
    expect(
      validateResetPayload({ token: 'abc', userType: 'employer' })
    ).not.toBeNull();
  });

  it('rejects invalid userType', () => {
    expect(
      validateResetPayload({ token: 'abc', password: 'newpass1', userType: 'admin' })
    ).not.toBeNull();
  });

  it('rejects password shorter than 8 chars', () => {
    expect(
      validateResetPayload({ token: 'abc', password: 'short', userType: 'employer' })
    ).toBe('Password must be at least 8 characters.');
  });

  it('accepts password of exactly 8 chars', () => {
    expect(
      validateResetPayload({ token: 'abc', password: '12345678', userType: 'employer' })
    ).toBeNull();
  });
});

describe('forgot-password validation', () => {
  it('passes with valid candidate email', () => {
    expect(
      validateForgotPayload({ email: 'user@example.com', userType: 'candidate' })
    ).toBeNull();
  });

  it('passes with valid employer email', () => {
    expect(
      validateForgotPayload({ email: 'boss@company.com', userType: 'employer' })
    ).toBeNull();
  });

  it('rejects missing email', () => {
    expect(
      validateForgotPayload({ userType: 'candidate' })
    ).not.toBeNull();
  });

  it('rejects invalid userType', () => {
    expect(
      validateForgotPayload({ email: 'x@y.com', userType: 'superadmin' })
    ).not.toBeNull();
  });
});
