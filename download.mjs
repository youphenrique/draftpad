import fs from "fs";
import https from "https";
import path from "path";

const EXTENSION_DIR = path.join(process.cwd(), "extension");

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const request = (targetUrl) => {
      https
        .get(targetUrl, (res) => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            const nextUrl = new URL(res.headers.location, targetUrl).toString();
            request(nextUrl);
            return;
          }
          const file = fs.createWriteStream(dest);
          res.pipe(file);
          file.on("finish", () => {
            file.close();
            console.log(`Downloaded ${path.basename(dest)}`);
            resolve();
          });
          file.on("error", reject);
        })
        .on("error", reject);
    };

    request(url);
  });
}

const files = [
  {
    url: "https://cdn.jsdelivr.net/npm/marked/marked.min.js",
    dest: path.join(EXTENSION_DIR, "marked.min.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/standalone.js",
    dest: path.join(EXTENSION_DIR, "prettier.browser.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/estree.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-estree.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/babel.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-babel.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/typescript.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-typescript.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/markdown.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-markdown.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/html.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-html.js"),
  },
  {
    url: "https://unpkg.com/prettier@3/plugins/postcss.js",
    dest: path.join(EXTENSION_DIR, "prettier-plugin-postcss.js"),
  },
];

for (const { url, dest } of files) {
  await download(url, dest);
}
