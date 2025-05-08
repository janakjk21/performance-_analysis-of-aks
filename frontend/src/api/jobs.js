export async function submitJob(inputData) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch("https://your-new-app-name.azurewebsites.net/api/jobs/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({
      task_type: "summarize",
      input_data: inputData,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Job submission failed");
  }

  return await response.json();
}

export async function checkJobStatus(jobId) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(`https://your-new-app-name.azurewebsites.net/api/jobs/${jobId}/status`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to check job status");
  }

  return await response.json();
}
