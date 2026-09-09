document.addEventListener("DOMContentLoaded", function() {
    // Fetch the under construction HTML file from your repository
    fetch("https://FoxURL.github.io/FB/under_construction.html")
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(html => {
            // Replace the entire document content with the fetched HTML
            document.open();
            document.write(html);
            document.close();
        })
        .catch(error => {
            console.error("Failed to load under construction page:", error);
        });
});