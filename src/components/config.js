export const languageOptions = [

  {
    language: "javascript",
    version: "18.15.0",
    aliases: ["node-javascript", "node-js", "javascript", "js"],
    runtime: "node",
  },
  {
    language: "typescript",
    version: "5.0.3",
    aliases: ["ts", "node-ts", "tsc", "typescript5", "ts5"],
  },
  {
    language: "python",
    version: "3.10.0",
    aliases: ["py", "py3", "python3", "python3.10"],
  },
  {
    language: "ruby",
    version: "3.0.1",
    aliases: ["ruby3", "rb"],
  },
  {
    language: "rust",
    version: "1.68.2",
    aliases: ["rs"],
  },
  {
    language: "csharp",
    version: "6.12.0",
    aliases: ["mono", "mono-csharp", "mono-c#", "mono-cs", "c#", "cs"],
    runtime: "mono",
  },
  {
    language: "cpp",
    version: "10.2.0",
    aliases: ["cpp", "g++"],
    runtime: "gcc",
  },
  {
    language: "go",
    version: "1.16.2",
    aliases: ["go", "golang"],
  },
  {
    language: "java",
    version: "15.0.2",
    aliases: [],
  },
  {
    language: "c",
    version: "10.2.0",
    aliases: ["gcc"],
    runtime: "gcc",
  },
];




export const codeSnippets = {
  javascript: `function sum(a, b) {
    return a + b;
  }
  console.log(sum(3, 4));`, 

  typescript: `const result: number = 3 + 4;
console.log(result); // Output: 7
`,

  python: `result = 3 + 4
print(result)  # Output: 7
`,

  ruby: `result = 3 + 4
puts result  # Output: 7
`,

  rust: `fn main() {
    let result = 3 + 4;
    println!("{}", result); // Output: 7
}
`,

  csharp: `using System;

class Program {
    static void Main() {
        int result = 3 + 4;
        Console.WriteLine(result); // Output: 7
    }
}`,

  cpp: `#include <iostream>
using namespace std;

int main() {
    int result = 3 + 4;
    cout << result << endl; // Output: 7
    return 0;
}
`,

  go: `package main

import "fmt"

func main() {
    result := 3 + 4
    fmt.Println(result) // Output: 7
}
`,

  java: `public class HelloWorld {
    public static void main(String[] args) {
        int result = 3 + 4;
        System.out.println(result); // Output: 7
    }
}`,

  c: `#include <stdio.h>

int main() {
    int result = 3 + 4;
    printf("%d", result); // Output: 7
    return 0;
}
`,
};


