"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Reset a student's password. Only accessible by teachers.
 */
export async function resetStudentPassword(
  studentId: string,
  newPassword: string
) {
  // Verify the caller is a logged-in teacher
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: "Not logged in" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "teacher") {
    return { error: "Only teachers can reset student passwords." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password harus minimal 6 karakter." };
  }

  try {
    // Use admin client to update the student's password
    const adminClient = createAdminClient();
    const { error } = await adminClient.auth.admin.updateUserById(studentId, {
      password: newPassword,
    });

    if (error) {
      if (error.message?.toLowerCase().includes("invalid api key")) {
        return {
          error:
            "Kunci SUPABASE_SERVICE_ROLE_KEY di .env.local belum valid. Masukkan secret key dari Supabase Dashboard.",
        };
      }
      return { error: `Gagal reset password: ${error.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Terjadi kesalahan saat memproses reset password." };
  }
}

/**
 * Reset a teacher's password using access code verification.
 * This is for the "forgot password" flow — no login required.
 */
export async function resetTeacherPassword(
  username: string,
  accessCode: string,
  newPassword: string
) {
  // Validate access code (case-insensitive, supports BUKAPINTU and GURU2024)
  const validCode = process.env.TEACHER_ACCESS_CODE || "BUKAPINTU";
  const cleanCode = accessCode?.trim().toUpperCase();
  if (
    cleanCode !== "BUKAPINTU" &&
    cleanCode !== "GURU2024" &&
    cleanCode !== validCode.toUpperCase()
  ) {
    return { error: "Kode Akses salah. Silakan periksa kembali atau hubungi admin." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password baru harus minimal 6 karakter." };
  }

  if (!username || username.trim().length === 0) {
    return { error: "Username tidak boleh kosong." };
  }

  const cleanUsername = username.trim().toLowerCase();
  const email = `${cleanUsername}@scienceportal.local`;

  try {
    const adminClient = createAdminClient();
    const { data: userList, error: listError } =
      await adminClient.auth.admin.listUsers();

    if (listError) {
      if (listError.message?.toLowerCase().includes("invalid api key")) {
        return {
          error:
            "Kunci SUPABASE_SERVICE_ROLE_KEY di .env.local belum valid. Masukkan secret key dari Supabase Dashboard.",
        };
      }
      return { error: `Terjadi kesalahan: ${listError.message}` };
    }

    const targetUser = userList.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!targetUser) {
      return { error: `Username "${username}" tidak ditemukan.` };
    }

    // Verify the user is actually a teacher (check user_metadata and profiles table)
    let isTeacher = targetUser.user_metadata?.role === "teacher";
    if (!isTeacher) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("role")
        .eq("id", targetUser.id)
        .single();
      if (profile?.role === "teacher") {
        isTeacher = true;
      }
    }

    if (!isTeacher) {
      return {
        error:
          "Akun ini bukan akun guru. Untuk reset password siswa, silakan gunakan tab Siswa atau hubungi guru Anda.",
      };
    }

    // Update the password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      return { error: `Gagal reset password: ${updateError.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Terjadi kesalahan saat memproses reset password." };
  }
}

/**
 * Reset a student's password using access code verification.
 * This is for the student "forgot password" flow — no login required.
 * Students need to provide their username and the teacher/master access code.
 */
export async function resetStudentPasswordPublic(
  username: string,
  accessCode: string,
  newPassword: string
) {
  // Validate access code (case-insensitive, supports BUKAPINTU and GURU2024)
  const validCode = process.env.TEACHER_ACCESS_CODE || "BUKAPINTU";
  const cleanCode = accessCode?.trim().toUpperCase();
  if (
    cleanCode !== "BUKAPINTU" &&
    cleanCode !== "GURU2024" &&
    cleanCode !== validCode.toUpperCase()
  ) {
    return { error: "Kode Akses salah. Silakan hubungi guru Anda." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { error: "Password baru harus minimal 6 karakter." };
  }

  if (!username || username.trim().length === 0) {
    return { error: "Username tidak boleh kosong." };
  }

  const cleanUsername = username.trim().toLowerCase();
  const email = `${cleanUsername}@scienceportal.local`;

  try {
    const adminClient = createAdminClient();
    const { data: userList, error: listError } =
      await adminClient.auth.admin.listUsers();

    if (listError) {
      if (listError.message?.toLowerCase().includes("invalid api key")) {
        return {
          error:
            "Kunci SUPABASE_SERVICE_ROLE_KEY di .env.local belum valid. Masukkan secret key dari Supabase Dashboard.",
        };
      }
      return { error: `Terjadi kesalahan: ${listError.message}` };
    }

    const targetUser = userList.users.find(
      (u) => u.email?.toLowerCase() === email
    );

    if (!targetUser) {
      return { error: `Username "${username}" tidak ditemukan.` };
    }

    // Update the password
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );

    if (updateError) {
      return { error: `Gagal reset password: ${updateError.message}` };
    }

    return { success: true };
  } catch (err: any) {
    return { error: err?.message || "Terjadi kesalahan saat memproses reset password." };
  }
}

