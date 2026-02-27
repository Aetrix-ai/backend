export function getUserPrompt(task: string) {
  return `

    #The task is to:
    ${task}

 
    
  **Things to notice**
  pass this info to subagent in case of task delegation:
   - tools read_file is for reading existing files, and write_file is for creating new  files in skills directory, [read only]
   - tools with codebase prefix are for accessing and modifying user's codebase, [read and write]
`;
}
