#!/usr/bin/env python3
import ast
import os
import sys

def extract_docstrings(file_path):
    """
    Extract docstrings from a Python file with detailed information.
    
    Args:
        file_path (str): Path to the Python file to extract docstrings from.
    
    Returns:
        dict: A dictionary containing extracted documentation for classes, functions, and module.
    """
    with open(file_path, 'r') as file:
        source = file.read()
    
    # Parse the source code
    module = ast.parse(source)
    
    # Documentation dictionary to store results
    docs = {
        'module_docstring': ast.get_docstring(module) or '',
        'classes': {},
        'functions': {}
    }
    
    # Iterate through module's body to find classes and functions
    for node in module.body:
        # Extract class docstrings
        if isinstance(node, ast.ClassDef):
            class_name = node.name
            class_docstring = ast.get_docstring(node) or ''
            
            # Extract method docstrings
            methods = {}
            for method in node.body:
                if isinstance(method, ast.FunctionDef):
                    method_name = method.name
                    method_docstring = ast.get_docstring(method) or ''
                    methods[method_name] = method_docstring
            
            docs['classes'][class_name] = {
                'docstring': class_docstring,
                'methods': methods
            }
        
        # Extract function docstrings
        elif isinstance(node, ast.FunctionDef):
            func_name = node.name
            func_docstring = ast.get_docstring(node) or ''
            docs['functions'][func_name] = func_docstring
    
    return docs

def generate_markdown(docs):
    """
    Convert extracted docstrings to Markdown format.
    
    Args:
        docs (dict): Documentation dictionary from extract_docstrings.
    
    Returns:
        str: Markdown-formatted documentation.
    """
    markdown = []
    
    # Module-level docstring
    if docs['module_docstring']:
        markdown.append("# Module Overview\n")
        markdown.append(docs['module_docstring'] + "\n")
    
    # Classes
    if docs['classes']:
        markdown.append("## Classes\n")
        for class_name, class_info in docs['classes'].items():
            markdown.append(f"### {class_name}\n")
            markdown.append(class_info['docstring'] + "\n")
            
            # Class methods
            if class_info['methods']:
                markdown.append("#### Methods:\n")
                for method_name, method_docstring in class_info['methods'].items():
                    markdown.append(f"- **{method_name}**\n")
                    markdown.append(f"  {method_docstring}\n")
    
    # Functions
    if docs['functions']:
        markdown.append("## Functions\n")
        for func_name, func_docstring in docs['functions'].items():
            markdown.append(f"### {func_name}\n")
            markdown.append(func_docstring + "\n")
    
    return "\n".join(markdown)

def main():
    if len(sys.argv) < 3:
        print("Usage: python docstring_extractor.py <input_python_file> <output_markdown_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    docs = extract_docstrings(input_file)
    markdown_docs = generate_markdown(docs)
    
    with open(output_file, 'w') as f:
        f.write(markdown_docs)
    
    print(f"Documentation extracted to {output_file}")

if __name__ == '__main__':
    main()