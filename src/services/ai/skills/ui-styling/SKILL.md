---
name: ui-styling 
description: this skills helps to style ui components using tailwind classes and shadcn ui components. use this skill when user ask to style any component or page in the codebase or during creating new component using react-coding skill
---


## Overview
This skill is designed to help you style UI components using Tailwind CSS classes and Shadcn UI components. It provides guidance on how to apply styling to components and pages in the codebase, ensuring a consistent and visually appealing user interface. Use this skill when you need to style any component or page in the codebase, or when creating new components using the react-coding skill.


## Instructions
### allowed-tools:
- filesystem-read_file
- filesystem-write_file 
- filesystem-search_files
- filesystem-list_directory


### 1. Identify the component or page that needs to be styled. This could be a new component you are creating or an existing component that requires styling.


### 2. If you are styling an existing component, use the **filesystem-read_file** tool to read the component file and understand its structure and functionality. This will help you determine how to apply styling effectively.


### 3. No hardcoded styling is allowed. Always use Tailwind CSS classes for styling components. If custom styling is needed, use Shadcn UI components available in the component/ui directory to maintain consistency with the design system.

## 4. for color scheme and design refer to the existing styled components in the codebase and follow the same pattern for styling new components. This will help maintain a cohesive look and feel across the application. for exisiting colors and design refer read src/index.css file and components/ui directory for shadcn ui components

### 5. **example styling approach**: for layout related styling use flexbox and grid classes provided by tailwind, for spacing use margin and padding classes, for typography use font size, weight and color classes use ptovided color from index.css file, for interactive elements like buttons use shadcn ui components and customize them using tailwind classes as needed. Always ensure that the styling is responsive and works well on different screen sizes.


## Rules always follow
- No direct hardcoding of styles is allowed.
- Dont overright index.css its read only file for refering color scheme and design you can add custom classes in index.css file but you are not allowed to change existing classes or color scheme in index.css file
- if user specifally ask to change color scheme or design then you can make changes in index.css file but make sure to follow the existing pattern and maintain consistency with the overall design of the application.
-*example for editing index.css*: if user ask change my website primary color to blue then you can change the primary color variable in index.css or if user ask to change theme of read and black then you can change the color variables in index.css file but make sure to follow the existing pattern and maintain consistency with the overall design of the application.
