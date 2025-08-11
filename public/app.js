document.getElementById("searchForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const query = Object.fromEntries(formData.entries());

    document.getElementById("results").innerHTML = "Searching...";

    try {
        const res = await fetch("/api/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(query)
        });

        const data = await res.json();

        if (data.results && data.results.length > 0) {
            document.getElementById("results").innerHTML =
                data.results.map(r => `<div><strong>${r.name}</strong> — ${r.email || "No email"} — ${r.phone || "No phone"}</div>`).join("");
        } else {
            document.getElementById("results").innerHTML = "No results found.";
        }
    } catch (err) {
        console.error(err);
        document.getElementById("results").innerHTML = "Error fetching results.";
    }
});
