import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { DavConfigurationContext } from '../AppSettings';

/**
 * Higher Order Component that checks authentication status
 * and redirects to login page if not authenticated.
 * Uses session-based authentication instead of Basic auth.
 * 
 * @param {React.Component} WrappedComponent - The component to wrap with authentication
 * @returns {React.Component} - The wrapped component with authentication check
 */
const withAuth = (WrappedComponent) => {
  const AuthenticatedComponent = (props) => {
    const davContext = useContext(DavConfigurationContext);
    const [isChecking, setIsChecking] = React.useState(true);
    const [hasChecked, setHasChecked] = React.useState(false);
    
    React.useEffect(() => {
      // Only check authentication once
      if (!hasChecked) {
        const checkAuth = async () => {
          try {
            await davContext.refreshUserInfo();
          } catch (error) {
            console.error('Error checking authentication:', error);
          } finally {
            setIsChecking(false);
            setHasChecked(true);
          }
        };
        
        checkAuth();
      }
    }, [davContext, hasChecked]);

    // Show loading while checking authentication
    if (isChecking) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div>Checking authentication...</div>
        </div>
      );
    }

    // If not authenticated, redirect to login
    if (!davContext.connectionValid) {
      return <Navigate to="/" replace />;
    }
    
    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };
  
  // Set display name for debugging purposes
  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

export default withAuth;
