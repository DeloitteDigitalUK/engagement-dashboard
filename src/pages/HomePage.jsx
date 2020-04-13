import React from "react";

import AuthenticatedLayout from '../layouts/AuthenticatedLayout';

export default function HomePage({ user }) {
  return (
    <AuthenticatedLayout user={user}>
      {user.displayName}
    </AuthenticatedLayout>
  );
}