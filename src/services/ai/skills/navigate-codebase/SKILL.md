---
name: navigate-codebase
description: Use this skill for navigating and understanding codebases, especially for generating summary that can be used to make changes to the codebase
---

# navigate-code


## Overview

This skill explains how to navigate and understand codebases in order to provide accurate, up-to-date guidance. and make changes to the codebase. It is designed to help understand the structure, functionality, and key components of a codebase, enabling you to effectively work with it and make informed decisions when modifying or extending it. for response template please refer to [template.md](./references/template.md)

## Instructions

### allowed-tools:
- filesystem-read_file
- filesystem-list_directory
- filesystem-read_multiple_files
- filesystem-search_files
- filesystem-directory_tree [**strict: dont use this tool in root directory**]
- filesystem-write_file[**rule: use this tool only if user ask to create doc files**]


### 1. Identify Relevant Documentation if procided find readme files if not provided proceed to deep dive into the codebase

### 2. find out entry points this may  in following files or folders
 - app directory contains the code that runs the application. It often includes the main application logic, components, and route
 - Look for src  they are commonly used as entry points in React applications 

### 3. Read src/app.tsx  to understand the structure of the codebase and how different components interact with each other.
 - Look for imports, function definitions, and component structures to get a sense of how the code is organized and how different parts of the application work together.
 - Pay attention to any comments or documentation within the code, as they can provide valuable insights into the purpose and functionality of different sections of the codebase.
 - **focus on impleation of wiring components together and how data flows through the application.**

### 4. list components  directory to understand what are the avialble componets
### 5.list components/ui directory to understand what are the avialble shadcn ui
### 6. If you encounter any unfamiliar concepts or technologies while reading the code, take the time to research and understand them. This will help you gain a deeper understanding of the codebase and enable you to provide more accurate guidance.



### 7. create a tree diagram of for entry point and components that are being used in the entry point. This will help you visualize the structure of the codebase and how different components are connected.


### 8. create a brief summary of the codebase based on your understanding. This summary should include key components, their functionality, and how they interact with each other. This will serve as a reference for you when making changes to the codebase in the future.



### Rules you should follow when using this skill:
- Always start by identifying the entry points of the codebase, as they provide a clear starting
- never read or list directory node_modules or package-lock.json as they are not relevant to understanding the codebase and can be very large and overwhelming.
- Focus on understanding the structure and functionality of the codebase, rather than getting bogged down
- read only necessary files to understand the codebase and make changes. Avoid reading files that are not relevant to your task, as this can lead to information overload and make it harder to focus on the important aspects of the codebase.




