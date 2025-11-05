export const formatValidationError = errors => {
  if (!errors || !errors.issues) return 'Unknown validation error';

  if (Array.isArray(errors.issues))
    return errors.issues.map(issue => issue.message).join(', ');

  return JSON.stringify(errors);
};
