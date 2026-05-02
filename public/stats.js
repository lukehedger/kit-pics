document.getElementById("clear-session")?.addEventListener("click", async () => {
  if (!confirm("Wipe all your likes and dislikes and start fresh?")) return;
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {}
  window.location.href = "/";
});
