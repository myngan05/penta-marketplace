
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function SupabaseTest() {
  const [status, setStatus] = useState("Đang kiểm tra...");

  useEffect(() => {
    async function checkConnection() {
      const { error } = await supabase
        .from("test_connection")
        .select("*")
        .limit(1);

      if (error && error.code === "42P01") {
        setStatus("Đã kết nối Supabase! Chưa có bảng kiểm tra.");
      } else if (error) {
        setStatus("Có lỗi: " + error.message);
      } else {
        setStatus("Kết nối Supabase thành công!");
      }
    }

    checkConnection();
  }, []);

  return (
    <div style={{ padding: 30 }}>
      <h2>Kiểm tra Supabase PENTA</h2>
      <p>{status}</p>
    </div>
  );
}

export default SupabaseTest;
