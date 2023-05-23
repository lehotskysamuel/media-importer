const readline = require("readline");
const fs = require("fs");
const os = require("os");
const path = require("path");
const cp = require("child_process");

const targetFolderName = "Lifelog-TODO-Move";
const videoExtensions = ["mp4"];
const imageExtensions = ["jpg", "jpeg", "png"];
const debugMode = true;

let writtenContent = "";

const debugLines = [];
const debug = (...args) => {
  console.log(...args);
  debugLines.push(args.join(" "));
};

function createTargetFolder() {
  const targetFolder = path.resolve(os.homedir(), "Desktop", targetFolderName);

  return new Promise((resolve, reject) => {
    if (fs.existsSync(targetFolder)) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question(
        "Output folder already exists. If you continue, more files will be added to it. Continue? ",
        (answer) =>
          !answer ||
          answer.toLowerCase() === "y" ||
          answer.toLowerCase() === "yes"
            ? resolve(targetFolder)
            : reject("Exiting...")
      );
    } else {
      fs.mkdirSync(targetFolder);
      debug("Created output folder at: ", targetFolder);
      resolve(targetFolder);
    }
  });
}

async function main() {
  const files = process.argv.slice(2);
  debug("Input files: ", files);

  const targetFolder = await createTargetFolder();
  const markdownFile = path.resolve(
    os.homedir(),
    "Desktop",
    `Lifelog-${Date.now()}.md`
  );

  const write = (content) => {
    writtenContent += content;
    fs.appendFileSync(markdownFile, content, {});
  };

  const unprocessedFiles = [];

  // TODO Sam - spytat sa na nazov galerie, lebo sa to blbo triedi z tych suborov

  write(`<Gallery title="TodoGalleryTitle">`);

  const moveFile = (filename) => {
    fs.renameSync(
      filename,
      path.resolve(targetFolder, path.basename(filename))
    );
  };

  files.forEach((filename) => {
    const extension = filename
      .slice(filename.lastIndexOf(".") + 1)
      .toLowerCase();

    if (imageExtensions.includes(extension)) {
      write(
        `\r\n  <Image desc="TodoImageTitle" src="${path.basename(filename)}" />`
      );
      moveFile(filename);
    } else if (videoExtensions.includes(extension)) {
      write(
        `\r\n  <Video desc="TodoVideoTitle" src="${path.basename(filename)}" />`
      );
      moveFile(filename);
    } else {
      unprocessedFiles.push(filename);
    }
  });

  write(`\r\n</Gallery>`);

  cp.execSync("clip", {
    input: writtenContent,
  });

  if (unprocessedFiles.length > 0) {
    write("\r\n\r\n=== ERRORS ===\r\n");
    write(
      `Could not process the following files: ${unprocessedFiles.join("\r\n")}`
    );
  }

  if (debugMode) {
    write("\r\n\r\n=== DEBUG INFO ===\r\n");
    write(debugLines.join("\r\n"));
  }

  process.exit();
}

main();
