import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 cek session lama
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        navigate("/database", { replace: true });
      } else {
        setLoading(false);
      }
    });
  }, [navigate]);

  async function handleLogin(e) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Login gagal");
    } else {
      navigate("/database", { replace: true });
    }
  }

  if (loading) return null;

  return (
    <form onSubmit={handleLogin} className="max-w-sm mx-auto mt-20 space-y-4">
      <input
        type="email"
        placeholder="Email"
        className="border p-2 w-full"
        required
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="border p-2 w-full"
        required
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full bg-blue-900 text-white py-2">Login</button>
    </form>
  );
}
