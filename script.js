const repositoryList = document.querySelector("#repository-list");
const listStatus = document.querySelector("#list-status");

function validateRepositories(data) {
  if (!Array.isArray(data)) {
    throw new Error("Repository data must be a JSON array.");
  }

  return data.map((repository, index) => {
    const entry = index + 1;
    if (!repository || typeof repository !== "object" || Array.isArray(repository)) {
      throw new Error(`Repository entry ${entry} must be an object.`);
    }

    for (const field of ["owner", "repository", "description", "url", "starredAt"]) {
      if (typeof repository[field] !== "string" || !repository[field].trim()) {
        throw new Error(`Repository entry ${entry} must have a non-empty ${field}.`);
      }
    }

    let url;
    try {
      url = new URL(repository.url);
    } catch {
      throw new Error(`Repository entry ${entry} must have a valid absolute URL.`);
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error(`Repository entry ${entry} URL must use HTTP or HTTPS.`);
    }

    const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(repository.starredAt);
    const date = dateParts ? new Date(0) : null;
    if (date && dateParts) {
      date.setUTCHours(0, 0, 0, 0);
      date.setUTCFullYear(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3]));
    }
    if (!date || date.toISOString().slice(0, 10) !== repository.starredAt) {
      throw new Error(`Repository entry ${entry} must have a valid starredAt date.`);
    }

    return { ...repository, url: url.href };
  });
}

async function loadRepositories() {
  let data;
  try {
    const response = await fetch("./events.json");
    if (!response.ok) {
      throw new Error(`Could not load repository data (${response.status}).`);
    }

    data = await response.json();
  } catch (error) {
    listStatus.textContent = "Unable to load starred repositories. Please try again later.";
    console.error("Failed to load starred repository data:", error);
    return;
  }

  let repositories;
  try {
    repositories = validateRepositories(data);
    if (repositories.length === 0) {
      listStatus.textContent = "No starred repositories yet.";
      return;
    }
  } catch (error) {
    listStatus.textContent = "Repository data is invalid. Please check events.json.";
    console.error("Invalid starred repository data:", error);
    return;
  }

  try {
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
