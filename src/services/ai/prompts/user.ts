export function getUserPrompt(task: string) {
  return `

    #The task is to:
    ${task}

  #Constraints:
     ## for any code base operation, use following tool
  - filesystem-read_file
  - filesystem-list_allowed_directories
  - filesystem-create_directory
  - filesystem-list_directory
  - filesystem-read_multiple_files
  - filesystem-search_files
  - filesystem-write_file[**for creating new files**]
  - filesystem-move_file [**for moving files if needed**]
  - filesystem-get_file_info
    
  **Things to notice**
  pass this info to subagent in case of task delegation:
   - tools read_file is for reading existing files, and write_file is for creating new  files in skills directory, [read only]
   - tools with -filesystem- prefix are for accessing and modifying user's codebase, [read and write]
`;
}
