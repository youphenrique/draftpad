import fs from "fs";
import https from "https";
import path from "path";

const url = "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
const dest = path.join(process.cwd(), "extension", "marked.min.js");

fs.mkdirSync(path.dirname(dest), { recursive: true });

https.get(url, (res) => {
  const file = fs.createWriteStream(dest);
  res.pipe(file);
  file.on("finish", () => {
    file.close();
    console.log("Downloaded marked.min.js");
  });
});
