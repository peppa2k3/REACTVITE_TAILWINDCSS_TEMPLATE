export const AppRoutes = [
  ///public routes
  {
    path: '*',
    element: (
      <PublicRoute>
        <HomePage login={true} />
      </PublicRoute>
    ),
  },
];
