addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/data.json') {
    return await fetchData()
  }

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  })
}

async function fetchData() {
  const response = await fetch('https://raw.githubusercontent.com/yz0812/some-stars/main/data.json')
  return response
}

const html = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Github Star 导航</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
    <style>
      .container {
        margin-left: auto;
        margin-right: auto;
        max-width: 1800px;
        padding-left: 20px;
        padding-right: 20px;
        overflow-x: hidden;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      #sidebar {
        position: fixed;
        top: 80px;
        left: 20px;
        bottom: 0;
        overflow-y: auto;
        width: 220px;
        padding-right: 20px;
      }
      #main-content {
        margin-left: 240px;
        flex-grow: 1;
        padding-left: 20px;
      }
      @media (max-width: 1024px) {
        #sidebar {
          position: relative;
          width: 100%;
          margin-bottom: 20px;
        }
        #main-content {
          margin-left: 0;
          padding-left: 0;
        }
      }
      @media (max-width: 640px) {
        #sidebar {
          display: none;
        }
        #main-content {
          margin-left: 0 !important;
          padding-left: 8px;
        }
      }
      #sidebar-links li {
        margin-bottom: 12px;
      }
      #sidebar-links li a {
        display: block;
        padding: 8px 12px;
        border-radius: 8px;
        background-color: #e2e8f0;
        transition: background-color 0.3s;
      }
      #sidebar-links li a:hover {
        background-color: #cbd5e0;
      }
      .highlight {
        background-color: yellow;
      }
      .sticky-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10;
        background-color: white;
      }
      #back-to-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #1a202c;
        color: white;
        padding: 10px 15px;
        border-radius: 50%;
        display: none;
        cursor: pointer;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        transition: opacity 0.3s;
      }
      #back-to-top:hover {
        background-color: #2d3748;
      }
      .repo-card {
        width: 300px;
        height: 400px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .repo-card img {
        height: 150px;
        width: 100%;
        object-fit: contain;
      }
      .repo-card .description {
        flex-grow: 1;
        overflow-y: hidden;
      }
      .repo-card .truncated-description {
        max-height: 80px;
        overflow: hidden;
      }
      .text-base {
        flex-grow: 1;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    </style>
  </head>
  <body class="bg-gray-100">
    <header class="sticky-header flex justify-between items-center px-4 py-2 bg-white shadow-md">
      <h1 id="github-star-导航" class="text-2xl font-bold">
        <a href="/" class="hidden md:block">Github Star 导航</a>
      </h1>
      <input id="search" type="text" placeholder="搜索..." class="border rounded px-2 py-1" />
    </header>
    <div class="container mx-auto p-4 py-16">
      <div id="sidebar">
        <h2 class="text-xl font-bold mb-4">语言分类</h2>
        <ul id="sidebar-links"></ul>
      </div>
      <div id="main-content">
        <div id="categories-container"></div>
      </div>
    </div>
    <button id="back-to-top">↑</button>
    <script>
      async function fetchData() {
        const response = await fetch("/data.json");
        return response.json();
      }

      function generateHTML(data) {
        const repoCardsHtml = (repos) => {
          return repos
            .map((repo) => {
              const truncatedDescription = repo.description && repo.description.length > 200 ? repo.description.slice(0, 200) + "..." : repo.description;
              return \`
          <div class="repo-card max-w-sm rounded-2xl overflow-hidden shadow-lg m-4 bg-white transition-transform transform hover:scale-105">
            <div class="h-48 overflow-hidden flex items-center justify-center mt-4 rounded-t-2xl">
              <img class="object-contain h-full w-full rounded-t-2xl" src="\${repo.owner.avatar_url}" alt="\${repo.owner.login}">
            </div>
            <div class="px-6 py-4">
              <div class="font-bold text-xl mb-2">
                <a href="\${repo.html_url}" class="text-blue-500">\${repo.full_name}</a>
              </div>
              <p class="text-gray-700 text-base">\${truncatedDescription}</p>
            </div>
            <div class="px-6 pt-4 pb-2">
              <span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Stars: \${repo.stargazers_count}</span>
            </div>
          </div>\`;
            })
            .join("");
        };

        const categoriesHtml = Object.keys(data)
          .map(
            (language) => \`
      <div id="\${language}" class="mb-8 category">
        <h2 class="text-2xl font-bold mb-4">\${language}</h2>
        <div class="flex flex-wrap justify-center">
          \${repoCardsHtml(data[language])}
        </div>
      </div>\`
          )
          .join("");

        const sidebarLinks = Object.keys(data)
          .map(
            (language) => \`
      <li class="mb-2"><a href="#\${language}" class="text-blue-500 hover:underline">\${language}</a></li>\`
          )
          .join("");

        document.getElementById("sidebar-links").innerHTML = sidebarLinks;
        document.getElementById("categories-container").innerHTML = categoriesHtml;
      }

      document.addEventListener("DOMContentLoaded", async function () {
        const searchInput = document.getElementById("search");
        const categoriesContainer = document.getElementById("categories-container");
        const backToTopButton = document.getElementById("back-to-top");
        const data = await fetchData();
        generateHTML(data);

        function repoCardsHtml(repos) {
          return repos
            .map(function (repo) {
              const truncatedDescription = repo.description && repo.description.length > 200 ? repo.description.slice(0, 200) + "..." : repo.description;
              return \`
          <div class="repo-card max-w-sm rounded-2xl overflow-hidden shadow-lg m-4 bg-white transition-transform transform hover:scale-105">
            <div class="h-48 overflow-hidden flex items-center justify-center mt-4 rounded-t-2xl">
              <img class="object-contain h-full w-full rounded-t-2xl" src="\${repo.owner.avatar_url}" alt="\${repo.owner.login}">
            </div>
            <div class="px-6 py-4">
              <div class="font-bold text-xl mb-2">
                <a href="\${repo.html_url}" class="text-blue-500">\${repo.full_name}</a>
              </div>
              <p class="text-gray-700 text-base">\${truncatedDescription}</p>
            </div>
            <div class="px-6 pt-4 pb-2">
              <span class="inline-block bg-blue-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">Stars: \${repo.stargazers_count}</span>
            </div>
          </div>\`;
            })
            .join("");
        }

        window.addEventListener("scroll", function () {
          if (window.scrollY > 200) {
            backToTopButton.style.display = "block";
          } else {
            backToTopButton.style.display = "none";
          }
        });

        backToTopButton.addEventListener("click", function () {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });

        function searchRepositories(query) {
          const normalizedQuery = query.toLowerCase();
          return Object.values(data)
            .flat()
            .filter((repo) => {
              return (
                repo.full_name.toLowerCase().includes(normalizedQuery) ||
                (repo.description && repo.description.toLowerCase().includes(normalizedQuery)) ||
                repo.topics.some((topic) => topic.toLowerCase().includes(normalizedQuery))
              );
            });
        }

        function escapeRegExp(string) {
          return string.replace(/[$()*+?.^{}|[\]\\]/g, '\\$&');
        }

        function highlightText(text, query) {
          const escapedQuery = escapeRegExp(query);
          return text.replace(new RegExp(escapedQuery, "gi"), (match) => \`<span class="highlight">\${match}</span>\`);
        }

        function highlightHtml(html, query) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          function walkNode(node) {
            if (node.nodeType === Node.TEXT_NODE) {
              const newNode = document.createElement("span");
              newNode.innerHTML = highlightText(node.textContent, query);
              node.parentNode.replaceChild(newNode, node);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              node.childNodes.forEach(walkNode);
            }
          }

          walkNode(doc.body);
          return doc.body.innerHTML;
        }

        searchInput.addEventListener("input", function () {
          const query = this.value.trim();
          if (query) {
            const matchedRepos = searchRepositories(query);
            const reposHtml = repoCardsHtml(matchedRepos);
            const highlightedHtml = highlightHtml(reposHtml, query);

            categoriesContainer.innerHTML = \`
        <div class="mb-8">
          <h2 class="text-2xl font-bold mb-4">Search Results</h2>
          <div class="flex flex-wrap justify-center">\${highlightedHtml}</div>
        </div>
      \`;
          } else {
            const categoriesHtml = Object.keys(data)
              .map(
                (language) => \`
          <div id="\${language}" class="mb-8 category">
            <h2 class="text-2xl font-bold mb-4">\${language} Repositories</h2>
            <div class="flex flex-wrap justify-center">\${repoCardsHtml(data[language])}</div>
          </div>
        \`
              )
              .join("");
            categoriesContainer.innerHTML = categoriesHtml;
          }
        });
      });
    </script>
  </body>
</html>
`