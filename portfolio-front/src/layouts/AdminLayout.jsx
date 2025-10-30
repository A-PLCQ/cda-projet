import { Outlet } from "react-router-dom";
import AdminHeader from "../components/admin/AdminHeader";
import AdminFooter from "../components/admin/AdminFooter";

export default function AdminLayout() {
  return (
    <div>
      <AdminHeader/>
      <main>
        <Outlet/>
      </main>
      <AdminFooter/>
    </div>
  );
}
