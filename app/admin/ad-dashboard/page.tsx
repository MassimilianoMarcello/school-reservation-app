import { auth } from "@/auth";
// import { redirect } from "next/navigation";

  const AdminDashboard = async () => {
    const session = await auth();

      // if (session?.user?.isTwoFactorEnabled && !session?.user?.twoFactorPass) {
      //   redirect('/login');
      // }

    if (session?.user?.role === "ADMIN") {
      return <div>Welcome, Admin!</div>;
    }

    return <div>Welcome, {session?.user?.email}</div>;
  };


export default AdminDashboard;