---
name: create-component
description: Use this skill for create new react component and connect it to the existing codebase
---

# navigate-code

## Overview

This skill explains how to create new react component and connect it to the existing codebase. It is designed to help you understand the process of creating a new component, integrating it into the existing codebase, and ensuring that it works seamlessly with the other components. for example cases please refer to [example.md](./references/example.md)

## Instructions

### 1. Anylyze user request and

### 2. find out entry points this may  in following files or folders
 - app directory contains the code that runs the application. It often includes the main application logic, components, and route
 - Look for routes/home.tsx  they are commonly used as entry points in React applications 

### 3. Read app/routes/home.tsx and app/route.tsx to understand the structure of the codebase and how different components interact with each other.
 - Look for imports, function definitions, and component structures to get a sense of how the code is organized and how different parts of the application work together.
 - Pay attention to any comments or documentation within the code, as they can provide valuable insights into the purpose and functionality of different sections of the codebase.
 - **focus on impleation of wiring components together and how data flows through the application.**

### 4. If you encounter any unfamiliar concepts or technologies while reading the code, take the time to research and understand them. This will help you gain a deeper understanding of the codebase and enable you to provide more accurate guidance.

### 5. create a tree diagram of for entry point and components that are being used in the entry point. This will help you visualize the structure of the codebase and how different components are connected.

### 6. create a brief summary of the codebase based on your understanding. This summary should include key components, their functionality, and how they interact with each other. This will serve as a reference for you when making changes to the codebase in the future.


### Rules you should follow when using this skill:
- Always start by identifying the entry points of the codebase, as they provide a clear starting
- never read or list directory node_modules or package-lock.json as they are not relevant to understanding the codebase and can be very large and overwhelming.
- Focus on understanding the structure and functionality of the codebase, rather than getting bogged down
- read only necessary files to understand the codebase and make changes. Avoid reading files that are not relevant to your task, as this can lead to information overload and make it harder to focus on the important aspects of the codebase.
- always follow [example.md](./references/example.md) structure for creating summary and tree diagram of the codebase. This will help you maintain consistency and ensure that your summaries are clear and easy to understand.




<!-- 
Tool: filesystem-create_directory
Tool: filesystem-directory_tree
Tool: filesystem-edit_file
Tool: filesystem-get_file_info
Tool: filesystem-list_allowed_directories
Tool: filesystem-list_directory
Tool: filesystem-move_file
Tool: filesystem-read_file
Tool: filesystem-read_multiple_files
Tool: filesystem-search_files
Tool: filesystem-write_file -->