import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminLayout } from './components/admin-layout';
import { AuditLogsPage } from './pages/audit-logs-page';
import { ContentPage } from './pages/content-page';
import { DashboardPage } from './pages/dashboard-page';
import { ReportsPage } from './pages/reports-page';
import { UsersPage } from './pages/users-page';

export function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route element={<UsersPage />} path="users" />
        <Route element={<ContentPage />} path="content" />
        <Route element={<ReportsPage />} path="reports" />
        <Route element={<AuditLogsPage />} path="audit-logs" />
      </Route>
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
