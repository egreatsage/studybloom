import AdminSidebar from '@/components/AdminSidebar';

export const metadata = {
  title: 'Admin - StudyBloom',
  description: 'StudyBloom Admin Dashboard',
};

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 md:p-6 py-16 px-1 overflow-x-hidden ">
        {children}
      </main>
    </div>
  );
}
