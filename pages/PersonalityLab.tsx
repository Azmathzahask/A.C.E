import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PersonalityLab is now integrated into Evaluation.
 * Redirecting to avoid broken links.
 */
const PersonalityLab: React.FC = () => {
  return <Navigate to="/evaluation" replace />;
};

export default PersonalityLab;
