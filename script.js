const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

async function loadRepositories() {
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repository data (${response.status}).`);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("Repository data must be a JSON array.");
    }

    if (repositories.length === 0) {
      listStatus.textContent = "No starred repositories yet.";
      return;
    }

    const items = repositories.map((repository) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = repository.url;
      link.textContent = `${repository.owner}/${repository.repository}`;

      const description = document.createElement("p");
      description.className = "repository-description";
      description.textContent = repository.description;

      const date = document.createElement("time");
      date.className = "repository-date";
      date.dateTime = repository.starredAt;
      date.textContent = `Starred on ${repository.starredAt}`;

      item.append(link, description, date);
      return item;
    });

    repositoryList.replaceChildren(...items);
    listStatus.textContent = "";
  } catch (error) {
    listStatus.textContent = "Unable to load starred repositories. Please try again later.";
    console.error("Failed to render starred repositories:", error);
  }
}

loadRepositories();
