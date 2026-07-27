import { readFileTool } from "./fs/read-file.js";
import { writeFileTool } from "./fs/write-file.js";
import { shellExecTool } from "./shell/exec.js";
import { gitDiffTool, gitCommitTool } from "./git/index.js";

export const agentTools = {
  read_file: readFileTool,
  write_file: writeFileTool,
  shell_exec: shellExecTool,
  git_diff: gitDiffTool,
  git_commit: gitCommitTool,
};
