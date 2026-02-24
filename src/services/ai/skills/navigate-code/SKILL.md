---
name: navigate-code
description: Use this skill for navigating and understanding codebases, especially for generating summary that can be used to make changes to the codebase
---

# navigate-code

## Overview

This skill explains how to navigate and understand codebases in order to provide accurate, up-to-date guidance. and make changes to the codebase. It is designed to help understand the structure, functionality, and key components of a codebase, enabling you to effectively work with it and make informed decisions when modifying or extending it.

## Instructions

### 1. Identify Relevant Documentation if procided find readme files

Use the fetch_url tool to read the following URL:
https://docs.langchain.com/llms.txt

This provides a structured list of all available documentation with descriptions.

### 2. Select Relevant Documentation

Based on the question, identify 2-4 most relevant documentation URLs from the index. Prioritize:

- Specific how-to guides for implementation questions
- Core concept pages for understanding questions
- Tutorials for end-to-end examples
- Reference docs for API details

### 3. Fetch Selected Documentation

Use the fetch_url tool to read the selected documentation URLs.

### 4. Provide Accurate Guidance

After reading the documentation, complete the user's request.