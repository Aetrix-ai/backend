---
name: react-coding
description: Use this skill for create new react component,editing existing components or any code and connect it to the existing codebase, use this tool when user ask to create new component or edit file in the codebase
---

# navigate-code

## Overview

This skill is designe to help you in crating , editing etx in an react codebase. It will guide you through the process of creating new react component,editing existing components or any code and connect it to the existing codebase. 

## Instructions

### allowed-tools:
- filesystem-read_file
- filesystem-list_allowed_directories
- filesystem-create_directory
- filesystem-list_directory
- filesystem-read_multiple_files
- filesystem-search_files
- filesystem-write_file[**for creating new files**]
- filesystem-move_file [**for moving files if needed**]
- filesystem-get_file_info

### 1. Anylyze user request and check if a new component needs to be created or existing component can be used.
    - if new component requires follow the steps and instruction for new component
    - else find what components can be reused check components directory for avialable custom built and component/ui for avialable shadcn components
  
### 2. Creating Custom components
  - you always follow react standars and best practises
  - always create componets using shadcn components avialble in component/ui 
  - built responsible componets
  - use taiwind classes for alignrment no hardcode styling need for custum styling use ui-styling skill
  - fianally verify responsiveness
  - create componet in side component **Caution: Not component/ui** using **filesystem-write_file**

### 3. Editing Existing components
  - use **filesystem-read_file** for reading that particalr file
  - make changes and use **filesystem-write_file** for overting the file entirely no patical editing is not allowed

### Rules 
 - follow react best practises
 - only use allowed tool dont use any tool that is prohibited to use


