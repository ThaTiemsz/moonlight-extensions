import console from "node:console";
import fs from "node:fs/promises";
import path from "node:path";

const srcDir = path.resolve("src");
const distDir = path.resolve("dist");

/**
 * Recursively list all files and directories in a directory.
 */
async function getPaths(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      return entry.isDirectory() ? [res, ...(await getPaths(res))] : res;
    })
  );
  return paths.flat();
}

/**
 * Remove files and directories in dist that don't exist in src.
 */
async function cleanUpRemovedFilesAndDirs() {
  try {
    const [srcPaths, distPaths] = await Promise.all([getPaths(srcDir), getPaths(distDir)]);

    const srcRelativePaths = srcPaths.map((p) => path.relative(srcDir, p));
    const distRelativePaths = distPaths.map((p) => path.relative(distDir, p));

    // Find extra files and directories in dist
    const pathsToDelete = distRelativePaths
      .filter((p) => !srcRelativePaths.includes(p))
      .sort((a, b) => b.length - a.length); // Delete deeper paths first

    for (const relativePath of pathsToDelete) {
      const fullPath = path.join(distDir, relativePath);
      try {
        const stat = await fs.lstat(fullPath);
        if (stat.isDirectory()) {
          await fs.rmdir(fullPath);
          console.log(`Deleted directory: ${fullPath}`);
        } else {
          await fs.rm(fullPath);
          console.log(`Deleted file: ${fullPath}`);
        }
      } catch (err) {
        console.error(`Failed to delete ${fullPath}:`, err);
      }
    }

    console.log("Cleanup complete.");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
}

cleanUpRemovedFilesAndDirs();
