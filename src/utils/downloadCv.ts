export const downloadCvFile = async (
  baseUrl: string,
  applicationId: string,
  fileName: string
) => {
  const token =
    sessionStorage.getItem("token") ?? localStorage.getItem("token") ?? "";
 
  const res = await fetch(`${baseUrl}/careers/${applicationId}/cv`, {
    headers: { Authorization: `Bearer ${token}` },
  });
 
  if (!res.ok) {
    throw new Error("Failed to download CV");
  }
 
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
 
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "cv.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
 