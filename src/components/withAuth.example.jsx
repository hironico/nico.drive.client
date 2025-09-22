// Example usage of the withAuth Higher Order Component

import React from 'react';
import withAuth from './withAuth';

// Example component that needs authentication
const ProtectedComponent = () => {
  return (
    <div>
      <h1>This is a protected component</h1>
      <p>You can only see this if you're authenticated!</p>
    </div>
  );
};

// Wrap the component with authentication
const AuthenticatedProtectedComponent = withAuth(ProtectedComponent);

// Usage in routes or other components:
// <Route path="/protected" element={<AuthenticatedProtectedComponent />} />

export default AuthenticatedProtectedComponent;
