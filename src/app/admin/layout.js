import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin - StudyBloom',
  description: 'StudyBloom Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 p-6 ">
        {children}
      </main>
    </div>
  );
}
